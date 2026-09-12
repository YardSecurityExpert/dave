import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { emptyState, loadState, saveState } from "./storage/state";
function directory(t: { after: (f: () => void) => void }) {
  const dir = mkdtempSync(join(tmpdir(), "dave-state-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
test("migrates intentional records and preserves a backup without re-enabling observation", (t) => {
  const dir = directory(t);
  const old = {
    mission: "Ship",
    currentPriority: "Demo",
    currentStep: "Record",
    parkedIdeas: [
      { title: "Idea", when: new Date().toISOString(), synced: false },
    ],
    corrections: [{ domainOrApp: "youtube.com", note: "research" }],
    trail: [{ title: "private browsing" }],
    stats: { interrupts: 1, recoveries: 2, parked: 1 },
    runtimeReady: true,
  };
  writeFileSync(join(dir, "state.json"), JSON.stringify(old));
  const state = loadState(dir);
  assert.equal(state.version, 2);
  assert.equal(state.mission, "Ship");
  assert.equal(state.parkedIdeas[0].title, "Idea");
  assert.match(state.parkedIdeas[0].id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(state.trail, []);
  assert.deepEqual(state.corrections, []);
  assert.equal(state.settings.trackingEnabled, false);
  assert.equal(state.runtimeReady, false);
  assert.ok(readdirSync(dir).includes("state-v1.backup.json"));
});
test("saved state never contains raw activity or runtime credentials", (t) => {
  const dir = directory(t);
  const state = emptyState();
  state.runtimeToken = "secret";
  state.trail.push({
    ts: 1,
    title: "private context",
    app: "Browser",
    dwellSec: 2,
  });
  saveState(dir, state);
  const stored = readFileSync(join(dir, "state.json"), "utf8");
  assert.equal(stored.includes("secret"), false);
  assert.equal(stored.includes("private context"), false);
  assert.equal(loadState(dir).trail.length, 0);
});
test("corrupt data is preserved before starting with an empty state", (t) => {
  const dir = directory(t);
  writeFileSync(join(dir, "state.json"), "{corrupt");
  const state = loadState(dir);
  assert.ok(state.storageWarning);
  const backup = readdirSync(dir).find((name) =>
    name.startsWith("state-unreadable-"),
  )!;
  assert.equal(readFileSync(join(dir, backup), "utf8"), "{corrupt");
  saveState(dir, state);
  assert.equal(readFileSync(join(dir, backup), "utf8"), "{corrupt");
});
