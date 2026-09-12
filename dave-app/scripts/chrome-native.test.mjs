import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  ChromeBridge,
  encodeFrame,
  frameReader,
} from "../src/main/services/chrome-bridge.ts";
const binary = fileURLToPath(
  new URL("../out/native/dave-chrome-bridge", import.meta.url),
);
const manifest = fileURLToPath(
  new URL("../../dave-extension/manifest.json", import.meta.url),
);
test("compiled Chrome host authenticates, relays context, and returns action results", async () => {
  const directory = mkdtempSync("/tmp/dave-native-");
  const bridge = new ChromeBridge(
    directory,
    directory,
    binary,
    manifest,
    () => {},
  );
  await bridge.start();
  const child = spawn(binary, [
    `chrome-extension://${bridge.extensionId}/`,
    "--config",
    bridge.configPath,
  ]);
  const messages = [];
  child.stdout.on(
    "data",
    frameReader((m) => messages.push(m)),
  );
  const until = async (fn) => {
    for (let i = 0; i < 100 && !fn(); i++)
      await new Promise((r) => setTimeout(r, 20));
    assert.ok(fn());
  };
  try {
    await until(() => messages.length > 0);
    child.stdin.write(
      encodeFrame({
        type: "snapshot",
        epoch: messages[0].epoch,
        clientId: "85b935df-4df8-4d9c-b05f-8d3f6a4cbf14",
        tabId: 4,
        documentId: "doc",
        revision: 1,
        data: {
          url: "https://chatgpt.com/c/abc",
          title: "Test conversation",
          messages: [{ role: "user", text: "A test fixture" }],
          coverage: "Latest loaded messages only",
          responseState: "unknown",
          canDraft: false,
        },
      }),
    );
    await until(() => bridge.state().chats.length === 1);
    const request = bridge.request(bridge.state().chats[0].id, "return");
    await until(() => messages.some((m) => m.type === "action"));
    child.stdin.write(
      encodeFrame({
        type: "result",
        id: messages.find((m) => m.type === "action").id,
        ok: true,
      }),
    );
    await request;
  } finally {
    child.kill();
    await bridge.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test("compiled host refuses a different extension origin", async () => {
  const directory = mkdtempSync("/tmp/dave-native-");
  const bridge = new ChromeBridge(
    directory,
    directory,
    binary,
    manifest,
    () => {},
  );
  await bridge.start();
  try {
    const child = spawn(binary, [
      "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/",
      "--config",
      bridge.configPath,
    ]);
    const code = await new Promise((resolve) => child.on("exit", resolve));
    assert.equal(code, 1);
  } finally {
    await bridge.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
