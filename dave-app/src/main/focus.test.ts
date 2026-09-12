import { test } from "node:test";
import assert from "node:assert/strict";
import { FocusService } from "./services/focus";
import { emptyState } from "./storage/state";
import type { AgentState, Recovery, TrailEvent } from "../shared/types";
import type { Classifier } from "./services/classifier";
const distracted: AgentState = {
  classification: "distracted",
  confidence: 0.95,
  reason: "Unrelated to the dashboard",
};
const event: TrailEvent = {
  ts: 0,
  app: "Safari",
  bundleId: "com.apple.Safari",
  title: "One page",
  url: "https://example.com/one?private=1",
  dwellSec: 0,
};
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));
function setup(
  classify: Classifier = async () => ({ agent: distracted, tokens: 12 }),
) {
  let now = 2000000,
    interrupts = 0;
  const recovered: Recovery[] = [];
  const state = emptyState();
  Object.assign(state, {
    mission: "Dashboard",
    currentStep: "Write findings",
    apiKeyConfigured: true,
  });
  Object.assign(state.settings, {
    trackingEnabled: true,
    aiEnabled: true,
    automaticNudges: true,
  });
  const engine = new FocusService(state, {
    save: () => {},
    publish: () => {},
    dismiss: () => {},
    interrupt: () => interrupts++,
    recover: async (target) => {
      recovered.push(target);
    },
    openUrl: async () => {},
    classify,
    clock: () => now,
  });
  return {
    state,
    engine,
    advance: (ms: number) => (now += ms),
    time: () => now,
    recovered,
    interrupts: () => interrupts,
  };
}
test("late classification cannot apply to a different page on the same domain", async () => {
  let finish!: (v: { agent: AgentState; tokens: number }) => void;
  const snapshots: any[] = [];
  const s = setup((snapshot) => {
    snapshots.push(snapshot);
    return new Promise((resolve) => (finish = resolve));
  });
  s.engine.observe(event);
  s.advance(10000);
  s.engine.observe(event);
  assert.equal(s.state.usage.requests, 1);
  s.engine.observe({ ...event, url: "https://example.com/two" });
  finish({ agent: distracted, tokens: 9 });
  await settle();
  assert.equal(s.state.agent.classification, "uncertain");
  assert.equal(s.state.trail.at(-1)?.classification, "uncertain");
  assert.equal(snapshots[0].activity.url, "https://example.com/one");
  assert.equal(s.state.usage.tokens, 9);
});
test("pause aborts classification, suppresses new requests, and resets idle dwell", async () => {
  let signal!: AbortSignal;
  let finish!: (v: { agent: AgentState; tokens: number }) => void;
  const s = setup((_snapshot, sig) => {
    signal = sig;
    return new Promise((resolve) => (finish = resolve));
  });
  s.engine.observe(event);
  s.advance(10000);
  s.engine.observe(event);
  s.engine.pause("15m");
  assert.equal(signal.aborted, true);
  s.advance(60000);
  s.engine.observe(event);
  finish({ agent: distracted, tokens: 5 });
  await settle();
  assert.equal(s.state.usage.requests, 1);
  assert.equal(s.state.agent.classification, "uncertain");
  s.engine.resume();
  s.engine.observe(event);
  assert.equal(s.state.trail.at(-1)?.dwellSec, 0);
  s.advance(2000);
  s.engine.observe(event);
  s.engine.unavailable("Idle");
  s.advance(60000);
  s.engine.observe(event);
  assert.equal(s.state.trail.at(-1)?.dwellSec, 0);
});
test("nudges fire once per episode and a chosen action is idempotent", async () => {
  const s = setup();
  s.state.recovery = {
    app: "Safari",
    bundleId: "com.apple.Safari",
    urls: ["https://example.com/work"],
  };
  for (let i = 0; i < 60; i++) {
    s.engine.observe(event);
    s.advance(2000);
    await settle();
  }
  assert.equal(s.interrupts(), 1);
  const id = s.state.intervention!.id;
  await Promise.all([s.engine.choose(id, "park"), s.engine.choose(id, "park")]);
  assert.equal(s.state.parkedIdeas.length, 1);
  assert.equal(s.state.parkedIdeas[0].url, event.url);
  for (let i = 0; i < 350; i++) {
    s.engine.observe(event);
    s.advance(2000);
    await settle();
  }
  assert.equal(s.interrupts(), 1);
});
test("daily cap and disabled AI prevent calls while local actions still work", async () => {
  let calls = 0;
  const s = setup(async () => {
    calls++;
    return { agent: distracted, tokens: 1 };
  });
  s.state.settings.dailyRequestLimit = 1;
  for (let i = 0; i < 100; i++) {
    s.engine.observe(event);
    s.advance(2000);
    await settle();
  }
  assert.equal(calls, 1);
  s.engine.pause("15m");
  s.engine.park({ title: "A manual idea" });
  assert.equal(s.state.parkedIdeas.length, 1);
  s.engine.resume();
  s.state.settings.aiEnabled = false;
  s.state.usage.requests = 0;
  s.advance(60000);
  s.engine.observe(event);
  await settle();
  assert.equal(calls, 1);
});
test("mission edits invalidate pending interventions and reset corrections", async () => {
  const s = setup();
  s.engine.preview();
  const id = s.state.intervention!.id;
  s.engine.setMission({
    mission: "Same dashboard",
    currentPriority: "A new priority",
    currentStep: "Review metrics",
  });
  await assert.rejects(() => s.engine.choose(id, "park"), /expired/);
  assert.equal(s.state.intervention, undefined);
  assert.equal(s.state.missionRevision, 1);
});
test("departure warnings derive from real commitments and do not repeat", () => {
  const s = setup();
  s.engine.saveCommitment({
    title: "Padel",
    startsAt: new Date(s.time() + 35 * 60000).toISOString(),
    travelMinutes: 30,
  });
  s.engine.tick();
  assert.equal(s.state.intervention?.kind, "departure");
  assert.equal(s.state.intervention?.minutesLeft, 5);
  assert.equal(s.interrupts(), 1);
  const id = s.state.intervention!.id;
  s.engine.observe(event);
  s.engine.observe({ ...event, title: "Another window" });
  s.engine.unavailable("Excluded activity");
  assert.equal(s.state.intervention?.id, id);
  s.advance(4 * 60000);
  s.engine.tick();
  assert.equal(s.interrupts(), 1);
});
test("excluded activity is never retained or sent to the classifier", async () => {
  let calls = 0;
  const s = setup(async () => {
    calls++;
    return { agent: distracted, tokens: 0 };
  });
  s.state.settings.excludedDomains = ["example.com"];
  s.engine.observe(event);
  s.advance(10000);
  s.engine.observe(event);
  await settle();
  assert.equal(calls, 0);
  assert.equal(s.state.trail.length, 0);
});
test("failed recovery keeps the intervention actionable and does not claim success", async () => {
  const s = setup();
  const state = s.state;
  state.recovery = {
    app: "Safari",
    bundleId: "com.apple.Safari",
    urls: ["https://example.com/work"],
  };
  const engine = new FocusService(state, {
    save: () => {},
    publish: () => {},
    dismiss: () => {},
    interrupt: () => {},
    recover: async () => {
      throw new Error("Window closed");
    },
    openUrl: async () => {},
    classify: async () => ({ agent: distracted, tokens: 0 }),
    clock: s.time,
  });
  engine.preview();
  const id = state.intervention!.id;
  await assert.rejects(() => engine.choose(id, "recover"), /Window closed/);
  assert.equal(state.intervention?.id, id);
  assert.equal(state.stats.recoveries, 0);
});
