import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

test("packaged helper protocol responds without collecting desktop activity", { timeout: 5000 }, async (t) => {
  const child = spawn(fileURLToPath(new URL("../out/native/dave-helper", import.meta.url)), [], { stdio: ["pipe", "pipe", "pipe"] });
  t.after(() => child.kill());
  const lines = createInterface({ input: child.stdout });
  t.after(() => lines.close());
  const first = once(lines, "line");
  child.stdin.write(JSON.stringify({ id: "ping-test", op: "ping" }) + "\n");
  assert.deepEqual(JSON.parse((await first)[0]), { id: "ping-test", ok: true, protocolVersion: 1 });
  const second = once(lines, "line");
  child.stdin.write(JSON.stringify({ id: "unsupported", op: "run-shell", command: "echo must-not-run" }) + "\n");
  assert.deepEqual(JSON.parse((await second)[0]), { id: "unsupported", error: "Unknown command" });
});
