import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { connect } from "node:net";
import { fileURLToPath } from "node:url";
import {
  ChromeBridge,
  encodeFrame,
  frameReader,
  MAX_FRAME,
} from "./services/chrome-bridge";
const manifest = fileURLToPath(
  new URL("../../../dave-extension/manifest.json", import.meta.url),
);
test("native framing handles split/coalesced messages and rejects oversized frames", () => {
  const received: unknown[] = [];
  const read = frameReader((m) => received.push(m));
  const frame = encodeFrame({ text: "héllo" });
  read(frame.subarray(0, 2));
  read(Buffer.concat([frame.subarray(2), encodeFrame({ ok: true })]));
  assert.deepEqual(received, [{ text: "héllo" }, { ok: true }]);
  const bad = Buffer.alloc(4);
  bad.writeUInt32LE(MAX_FRAME + 1);
  assert.throws(() => read(bad));
});
test("authenticated Chrome snapshots and actions are invalidated on pause", async () => {
  const directory = mkdtempSync("/tmp/dave-bridge-");
  const bridge = new ChromeBridge(
    directory,
    directory,
    "/test/host",
    manifest,
    () => {},
  );
  await bridge.start();
  const config = JSON.parse(readFileSync(bridge.configPath, "utf8"));
  const socket = connect(bridge.socketPath);
  const messages: any[] = [];
  socket.on(
    "data",
    frameReader((v) => messages.push(v)),
  );
  const until = async (fn: () => boolean) => {
    for (let i = 0; i < 100 && !fn(); i++)
      await new Promise((r) => setTimeout(r, 10));
    assert.ok(fn());
  };
  try {
    socket.write(
      encodeFrame({
        type: "auth",
        token: config.token,
        origin: `chrome-extension://${bridge.extensionId}/`,
      }),
    );
    await until(() => messages.length > 0);
    const epoch = messages[0].epoch;
    const snap = {
      type: "snapshot",
      epoch,
      clientId: "85b935df-4df8-4d9c-b05f-8d3f6a4cbf14",
      tabId: 1,
      documentId: "one",
      revision: 1,
      data: {
        url: "https://chatgpt.com/c/abc",
        title: "Dashboard",
        messages: [{ role: "user", text: "Write findings" }],
        coverage: "Latest loaded messages only",
        responseState: "unknown",
        canDraft: true,
      },
    };
    socket.write(encodeFrame(snap));
    await until(() => bridge.state().chats.length === 1);
    const id = bridge.state().chats[0].id;
    const request = bridge.request(id, "return");
    await until(() => messages.some((m) => m.type === "action"));
    const action = messages.find((m) => m.type === "action");
    socket.write(encodeFrame({ type: "result", id: action.id, ok: true }));
    await request;
    bridge.control(false);
    assert.equal(bridge.state().chats.length, 0);
    socket.write(encodeFrame(snap));
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(bridge.state().chats.length, 0);
    assert.throws(() => bridge.get(id));
  } finally {
    socket.destroy();
    await bridge.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
