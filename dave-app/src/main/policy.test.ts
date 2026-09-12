import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shouldInterrupt,
  mergeTrail,
  decisionFor,
  recoveryFrom,
  activityKey,
  safeUrl,
  modelUrl,
  excluded,
  upcomingCommitments,
} from "./policy";
import { emptyState } from "./storage/state";
const now = 2000000;
const distracted = {
  classification: "distracted" as const,
  confidence: 0.8,
  reason: "Unrelated video",
};
function state() {
  const s = emptyState();
  Object.assign(s, { mission: "Ship demo", currentStep: "Record recovery" });
  s.trail = [
    {
      id: "episode",
      ts: now,
      app: "Safari",
      bundleId: "com.apple.Safari",
      title: "Video",
      url: "https://youtube.com/watch?v=1",
      dwellSec: 90,
    },
  ];
  return s;
}
test("dwell, confidence, cooldown, completion and pause gate interruptions", () => {
  const s = state();
  assert.equal(shouldInterrupt(s, distracted, 0, now), true);
  s.trail[0].dwellSec = 89;
  assert.equal(shouldInterrupt(s, distracted, 0, now), false);
  s.trail[0].dwellSec = 90;
  assert.equal(
    shouldInterrupt(s, { ...distracted, confidence: 0.69 }, 0, now),
    false,
  );
  assert.equal(shouldInterrupt(s, distracted, now - 599999, now), false);
  s.pausedUntil = now + 1;
  assert.equal(shouldInterrupt(s, distracted, 0, now), false);
  s.pausedUntil = 0;
  s.completedAt = new Date(now).toISOString();
  assert.equal(shouldInterrupt(s, distracted, 0, now), false);
});
test("a correction exempts one activity, not its whole domain", () => {
  const s = state();
  s.corrections.push({
    domainOrApp: "youtube.com",
    activityKey: activityKey(s.trail[0]),
    note: "research",
  });
  assert.equal(shouldInterrupt(s, distracted, 0, now), false);
  s.trail[0] = { ...s.trail[0], url: "https://youtube.com/watch?v=2" };
  assert.equal(shouldInterrupt(s, distracted, 0, now), true);
  assert.equal(
    shouldInterrupt(s, { ...distracted, classification: "uncertain" }, 0, now),
    false,
  );
});
test("unrelated tasks on the same domain never combine dwell", () => {
  const s = state();
  s.trail[0].dwellSec = 45;
  s.trail.push({ ...s.trail[0], title: "Other video", dwellSec: 45 });
  assert.equal(shouldInterrupt(s, distracted, 0, now), false);
});
test("history is bounded, updates timestamps, and starts new dwell after an idle gap", () => {
  const event = state().trail[0];
  const result = mergeTrail([event], { ...event, ts: now + 2000, dwellSec: 2 });
  assert.equal(result[0].dwellSec, 92);
  assert.equal(result[0].ts, now + 2000);
  assert.equal(
    mergeTrail(result, { ...event, id: "new-episode", dwellSec: 0 }).at(-1)
      ?.dwellSec,
    0,
  );
  const trail = Array.from({ length: 30 }, (_, index) => ({
    ...event,
    title: String(index),
  }));
  assert.equal(mergeTrail(trail, { ...event, title: "new" }).length, 30);
});
test("recovery selects only the most recent work destination", () => {
  const event = state().trail[0];
  const work = [
    {
      ...event,
      url: "https://first.example",
      classification: "on_track" as const,
    },
    {
      ...event,
      title: "Current task",
      url: "https://second.example",
      classification: "on_track" as const,
    },
    event,
  ];
  assert.deepEqual(recoveryFrom(work), {
    app: "Safari",
    bundleId: "com.apple.Safari",
    title: "Current task",
    urls: ["https://second.example"],
  });
});
test("unknown deadlines stay absent and commitments derive departure from recorded travel", () => {
  const s = state();
  assert.equal(decisionFor(s, distracted, now).minutesLeft, null);
  s.deadline = new Date(now + 10 * 60000).toISOString();
  assert.equal(decisionFor(s, distracted, now).minutesLeft, 10);
  s.commitments.push({
    id: "test",
    title: "Padel",
    startsAt: new Date(now + 60 * 60000).toISOString(),
    travelMinutes: 30,
  });
  assert.equal(upcomingCommitments(s, now)[0].leaveAt, now + 30 * 60000);
});
test("URLs are validated and minimized before transmission; domain exclusions include subdomains", () => {
  assert.equal(safeUrl("not a url"), undefined);
  assert.equal(safeUrl("file:///secret"), undefined);
  assert.equal(safeUrl("https://user:secret@example.com"), undefined);
  assert.equal(
    modelUrl("https://example.com/task?token=secret#private"),
    "https://example.com/task",
  );
  const s = state();
  s.settings.excludedDomains = ["example.com"];
  assert.equal(
    excluded({ ...s.trail[0], url: "https://private.example.com" }, s.settings),
    true,
  );
  assert.equal(
    excluded({ ...s.trail[0], url: "https://notexample.com" }, s.settings),
    false,
  );
});
