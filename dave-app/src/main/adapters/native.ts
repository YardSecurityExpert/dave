import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Recovery, Settings, TrailEvent } from "../../shared/types";
import { safeUrl } from "../policy";
const observation = z.object({
  status: z.string(),
  app: z.string().max(4000).optional(),
  bundleId: z.string().max(4000).optional(),
  title: z.string().max(4000).optional(),
  url: z.string().max(8192).optional(),
});
export type Observation = { status: string; event?: TrailEvent };
export class NativeAdapter {
  private child?: ChildProcessWithoutNullStreams;
  private pending = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timer: NodeJS.Timeout;
    }
  >();
  constructor(private path: string) {}
  private start() {
    if (this.child) return;
    const child = spawn(this.path, [], { stdio: ["pipe", "pipe", "pipe"] });
    this.child = child;
    child.stderr.resume();
    createInterface({ input: child.stdout }).on("line", (line) => {
      if (line.length > 65536) {
        this.stop();
        return;
      }
      try {
        const value = JSON.parse(line);
        const call = this.pending.get(value.id);
        if (!call) return;
        this.pending.delete(value.id);
        clearTimeout(call.timer);
        value.error
          ? call.reject(new Error(String(value.error)))
          : call.resolve(value);
      } catch {
        this.stop();
      }
    });
    const ended = () => {
      if (this.child === child) this.stop();
    };
    child.on("error", ended);
    child.on("exit", ended);
    child.stdin.on("error", ended);
  }
  async request(op: string, args: object = {}): Promise<any> {
    this.start();
    const id = randomUUID();
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.stop(), 5000);
      this.pending.set(id, { resolve, reject, timer });
      this.child!.stdin.write(JSON.stringify({ id, op, ...args }) + "\n");
    });
  }
  async observe(settings: Settings): Promise<Observation> {
    const value = observation.parse(
      await this.request("observe", {
        chromeEnabled: settings.chromeEnabled,
        safariEnabled: settings.safariEnabled,
        excludedApps: settings.excludedApps,
      }),
    );
    if (value.status !== "ready" || !value.app) return { status: value.status };
    // A browser page with an unsupported URL provides no usable context.
    if (value.url !== undefined && !safeUrl(value.url))
      return { status: "private-or-empty" };
    return {
      status: "ready",
      event: {
        ts: Date.now(),
        app: value.app,
        bundleId: value.bundleId,
        title: value.title || "",
        url: safeUrl(value.url),
        dwellSec: 0,
      },
    };
  }
  async recover(recovery: Recovery) {
    if (!recovery.bundleId)
      throw new Error("Pin a work window before using Return to work.");
    const result = await this.request("recover", {
      bundleId: recovery.bundleId,
      title: recovery.title,
      url: recovery.urls[0],
    });
    if (result.ok !== true) throw new Error("Your work could not be restored.");
  }
  stop() {
    const child = this.child;
    this.child = undefined;
    child?.kill();
    for (const call of this.pending.values()) {
      clearTimeout(call.timer);
      call.reject(
        new Error("The activity helper stopped. Dave will retry shortly."),
      );
    }
    this.pending.clear();
  }
}
