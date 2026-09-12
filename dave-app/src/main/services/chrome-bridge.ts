import { createServer, type Socket, type Server } from "node:net";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import {
  randomBytes,
  randomUUID,
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import type { ChromeChat, ChromeState } from "../../shared/integrations";
export const MAX_FRAME = 64 * 1024;
export function encodeFrame(value: unknown) {
  const body = Buffer.from(JSON.stringify(value));
  if (body.length > MAX_FRAME) throw new Error("Message too large");
  const header = Buffer.alloc(4);
  header.writeUInt32LE(body.length);
  return Buffer.concat([header, body]);
}
export function frameReader(receive: (value: unknown) => void) {
  let buffer: Buffer = Buffer.alloc(0);
  return (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      const n = buffer.readUInt32LE();
      if (n > MAX_FRAME || n === 0) throw new Error("Invalid frame size");
      if (buffer.length < n + 4) return;
      const data = buffer.subarray(4, n + 4);
      buffer = buffer.subarray(n + 4);
      receive(JSON.parse(data.toString("utf8")));
    }
  };
}
const chatUrl = z
  .string()
  .max(500)
  .regex(/^https:\/\/chatgpt\.com\/(?:g\/[^/?#]+\/)?c\/[a-zA-Z0-9-]{1,100}$/);
const snapshot = z.object({
  type: z.literal("snapshot"),
  epoch: z.string(),
  clientId: z.string().uuid(),
  tabId: z.number().int().nonnegative(),
  documentId: z.string().min(1).max(100),
  revision: z.number().int().nonnegative(),
  data: z.object({
    url: chatUrl,
    title: z.string().max(500),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          text: z.string().max(12000),
        }),
      )
      .min(1)
      .max(6)
      .refine((m) => m.reduce((n, x) => n + x.text.length, 0) <= 12000),
    coverage: z.literal("Latest loaded messages only"),
    responseState: z.enum(["responding", "unknown"]),
    canDraft: z.boolean(),
  }),
});
export class ChromeBridge {
  private token = randomBytes(32).toString("hex");
  private epoch = randomUUID();
  private server?: Server;
  private peers = new Set<Socket>();
  private chats = new Map<string, { chat: ChromeChat; socket: Socket }>();
  private pending = new Map<
    string,
    {
      socket: Socket;
      resolve: () => void;
      reject: (e: Error) => void;
      timer: NodeJS.Timeout;
    }
  >();
  private enabled = true;
  private timer?: NodeJS.Timeout;
  readonly extensionId: string;
  readonly socketPath: string;
  readonly configPath: string;
  private manifestPath: string;
  constructor(
    private directory: string,
    private appData: string,
    public hostBinary: string,
    manifest: string,
    private changed: () => void,
  ) {
    const key = JSON.parse(readFileSync(manifest, "utf8")).key;
    this.extensionId = [
      ...createHash("sha256")
        .update(Buffer.from(key, "base64"))
        .digest()
        .subarray(0, 16),
    ]
      .map((b) => String.fromCharCode(97 + (b >> 4), 97 + (b & 15)))
      .join("");
    this.socketPath = join(directory, "chrome.sock");
    this.configPath = join(directory, "chrome-bridge.json");
    this.manifestPath = join(
      appData,
      "Google/Chrome/NativeMessagingHosts/app.thedave.chrome.json",
    );
  }
  async start() {
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    if (existsSync(this.socketPath)) unlinkSync(this.socketPath);
    this.server = createServer((socket) => {
      let authenticated = false;
      const deadline = setTimeout(() => socket.destroy(), 3000);
      socket.on("error", () => {});
      const read = frameReader((value) => {
        if (!authenticated) {
          const auth = z
            .object({
              type: z.literal("auth"),
              token: z.string(),
              origin: z.string(),
            })
            .parse(value);
          const a = Buffer.from(auth.token),
            b = Buffer.from(this.token);
          if (
            a.length !== b.length ||
            !timingSafeEqual(a, b) ||
            auth.origin !== `chrome-extension://${this.extensionId}/`
          )
            throw new Error("Unknown client");
          authenticated = true;
          clearTimeout(deadline);
          this.peers.add(socket);
          socket.write(
            encodeFrame({
              type: "control",
              enabled: this.enabled,
              epoch: this.epoch,
            }),
          );
          return;
        }
        const data = value as any;
        if (data.type === "result") {
          const p = this.pending.get(data.id);
          if (p?.socket === socket) {
            clearTimeout(p.timer);
            this.pending.delete(data.id);
            data.ok === true
              ? p.resolve()
              : p.reject(
                  new Error(
                    typeof data.error === "string"
                      ? data.error.slice(0, 300)
                      : "Chrome action failed.",
                  ),
                );
          }
          return;
        }
        if (data.type === "remove") {
          for (const [id, item] of this.chats)
            if (item.socket === socket && item.chat.tabId === data.tabId)
              this.chats.delete(id);
          this.changed();
          return;
        }
        const parsed = snapshot.parse(value);
        if (!this.enabled || parsed.epoch !== this.epoch) return;
        const id =
          parsed.clientId + ":" + parsed.tabId + ":" + parsed.documentId;
        const previous = this.chats.get(id);
        if (
          previous &&
          (previous.socket !== socket ||
            parsed.revision < previous.chat.revision)
        )
          return;
        if (!previous && this.chats.size >= 20) return;
        this.chats.set(id, {
          socket,
          chat: {
            id,
            clientId: parsed.clientId,
            tabId: parsed.tabId,
            documentId: parsed.documentId,
            revision: parsed.revision,
            observedAt: Date.now(),
            ...parsed.data,
          },
        });
        this.changed();
      });
      socket.on("data", (chunk) => {
        try {
          read(chunk);
        } catch {
          socket.destroy();
        }
      });
      socket.on("close", () => {
        clearTimeout(deadline);
        this.peers.delete(socket);
        for (const [id, x] of this.chats)
          if (x.socket === socket) this.chats.delete(id);
        for (const [id, p] of this.pending)
          if (p.socket === socket) {
            clearTimeout(p.timer);
            p.reject(new Error("Chrome disconnected."));
            this.pending.delete(id);
          }
        this.changed();
      });
    });
    await new Promise<void>((resolve, reject) => {
      this.server!.once("error", reject);
      this.server!.listen(this.socketPath, resolve);
    });
    chmodSync(this.socketPath, 0o600);
    writeFileSync(
      this.configPath + ".tmp",
      JSON.stringify({
        socketPath: this.socketPath,
        token: this.token,
        extensionId: this.extensionId,
      }),
      { mode: 0o600 },
    );
    renameSync(this.configPath + ".tmp", this.configPath);
    this.timer = setInterval(() => {
      let changed = false;
      for (const [id, item] of this.chats)
        if (Date.now() - item.chat.observedAt > 20000) {
          this.chats.delete(id);
          changed = true;
        }
      if (changed) this.changed();
    }, 5000);
  }
  install() {
    mkdirSync(join(this.appData, "Google/Chrome/NativeMessagingHosts"), {
      recursive: true,
    });
    writeFileSync(
      this.manifestPath,
      JSON.stringify(
        {
          name: "app.thedave.chrome",
          description: "Dave Chrome connection",
          path: this.hostBinary,
          type: "stdio",
          allowed_origins: [`chrome-extension://${this.extensionId}/`],
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    this.changed();
    return this.extensionId;
  }
  state(): ChromeState {
    return {
      enabled: this.enabled,
      registered: existsSync(this.manifestPath),
      extensionId: this.extensionId,
      chats: [...this.chats.values()].map((x) => x.chat),
    };
  }
  control(enabled: boolean, force = false) {
    if (enabled === this.enabled && !force) return;
    this.enabled = enabled;
    this.epoch = randomUUID();
    this.chats.clear();
    for (const [id, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(new Error("Dave connection changed."));
      this.pending.delete(id);
    }
    for (const socket of this.peers)
      socket.write(
        encodeFrame({ type: "control", enabled, epoch: this.epoch }),
      );
    this.changed();
  }
  get(id: string): ChromeChat {
    const item = this.chats.get(id);
    if (!this.enabled || !item || Date.now() - item.chat.observedAt > 15000)
      throw new Error(
        "Reconnect this chat using the Dave extension in Chrome.",
      );
    return item.chat;
  }
  request(id: string, operation: "return" | "draft", text?: string) {
    const chat = this.get(id),
      socket = this.chats.get(id)!.socket,
      requestId = randomUUID();
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(
          new Error(
            "Chrome did not confirm the action. Check the tab before retrying.",
          ),
        );
      }, 7000);
      this.pending.set(requestId, { resolve, reject, timer, socket });
      socket.write(
        encodeFrame({
          type: "action",
          id: requestId,
          operation,
          text,
          tabId: chat.tabId,
          url: chat.url,
          revision: chat.revision,
          epoch: this.epoch,
          expiresAt: Date.now() + 6500,
        }),
      );
    });
  }
  async close() {
    clearInterval(this.timer);
    this.control(false, true);
    for (const p of this.peers) p.destroy();
    await new Promise<void>((resolve) =>
      this.server ? this.server.close(() => resolve()) : resolve(),
    );
    if (existsSync(this.configPath)) unlinkSync(this.configPath);
  }
}
