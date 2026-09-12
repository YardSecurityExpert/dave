import { test } from "node:test";
import assert from "node:assert/strict";
import { ClassificationScheduler } from "./services/scheduler";
import { openAIClassifier, type Snapshot } from "./services/classifier";
const snapshot: Snapshot = {
  id: "request",
  missionRevision: 1,
  activityId: "page",
  mission: { mission: "Ship", currentPriority: "Demo", currentStep: "Record" },
  activity: { app: "Safari", title: "Docs" },
};
const callbacks = {
  started: () => {},
  result: () => {},
  error: () => {},
  usage: () => {},
};
test("scheduler uses bounded backoff, stops after three failures, and resume permits retry", async () => {
  let now = 2000000,
    calls = 0;
  const scheduler = new ClassificationScheduler(
    async () => {
      calls++;
      throw new Error("offline");
    },
    () => now,
  );
  await scheduler.offer(snapshot, callbacks);
  await scheduler.offer(snapshot, callbacks);
  assert.equal(calls, 1);
  now += 60000;
  await scheduler.offer(snapshot, callbacks);
  assert.equal(calls, 2);
  now += 120000;
  await scheduler.offer(snapshot, callbacks);
  assert.equal(calls, 3);
  now += 600000;
  await scheduler.offer(snapshot, callbacks);
  assert.equal(calls, 3);
  scheduler.cancel();
  await scheduler.offer(snapshot, callbacks);
  assert.equal(calls, 4);
});
test("classifier sends bounded structured requests with no tools or stored response", async () => {
  let payload: any;
  const classify = openAIClassifier(() => "sk-test", (async (
    _url: unknown,
    init: RequestInit,
  ) => {
    payload = JSON.parse(String(init.body));
    return new Response(
      JSON.stringify({
        status: "completed",
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  classification: "uncertain",
                  confidence: 0.4,
                  reason: "Could be research",
                }),
              },
            ],
          },
        ],
        usage: { total_tokens: 123 },
      }),
    );
  }) as typeof fetch);
  const result = await classify(snapshot, new AbortController().signal);
  assert.equal(result.tokens, 123);
  assert.equal(result.agent.classification, "uncertain");
  assert.equal(payload.store, false);
  assert.deepEqual(payload.tools, []);
  assert.equal(payload.text.format.strict, true);
});
test("malformed model output fails closed", async () => {
  const classify = openAIClassifier(
    () => "sk-test",
    (async () =>
      new Response(
        JSON.stringify({
          status: "completed",
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: '{"classification":"distracted","confidence":99,"reason":"bad"}',
                },
              ],
            },
          ],
        }),
      )) as typeof fetch,
  );
  await assert.rejects(() => classify(snapshot, new AbortController().signal));
});
