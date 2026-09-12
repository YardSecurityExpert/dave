import { test } from "node:test";
import assert from "node:assert/strict";
import type { RunAgentInput } from "@ag-ui/core";
import { demoEvents } from "./demo-protocol";
const decision = {
  site: "youtube.com",
  reason: "This rabbit hole can wait.",
  minutesLeft: 90,
  unfinished: "Record the demo",
  attentionCostMin: 4,
  recovery: { urls: [] },
  parkingCandidate: true,
  parkingTitle: "Lo-fi video",
};
const input: RunAgentInput = {
  threadId: "test-thread",
  runId: "test-run",
  state: {},
  tools: [],
  context: [],
  forwardedProps: {},
  messages: [
    {
      id: "drift",
      role: "user",
      content: "ACTIVITY_DRIFT " + JSON.stringify(decision),
    },
  ],
};
test("demo emits a real AG-UI interrupt call, with no recovery before choice", () => {
  const events = demoEvents(input) as any[];
  assert.equal(events[0].type, "RUN_STARTED");
  assert.deepEqual(
    events
      .filter((e) => e.type === "TOOL_CALL_START")
      .map((e) => e.toolCallName),
    ["driftInterrupt"],
  );
  assert.deepEqual(
    JSON.parse(events.find((e) => e.type === "TOOL_CALL_ARGS").delta),
    decision,
  );
  assert.equal(events.at(-1).type, "RUN_FINISHED");
});
for (const [choice, expected] of [
  ["recover", "recover"],
  ["park", "parkIdea"],
  ["correct", "correct"],
]) {
  test(`demo resumes ${choice} through exactly one frontend tool`, () => {
    const resumed: RunAgentInput = {
      ...input,
      messages: [
        ...input.messages,
        {
          id: "assistant",
          role: "assistant",
          toolCalls: [
            {
              id: "interrupt",
              type: "function",
              function: {
                name: "driftInterrupt",
                arguments: JSON.stringify(decision),
              },
            },
          ],
        },
        {
          id: "choice",
          role: "tool",
          toolCallId: "interrupt",
          content: JSON.stringify({ choice }),
        },
      ],
    };
    const calls = (demoEvents(resumed) as any[]).filter(
      (e) => e.type === "TOOL_CALL_START",
    );
    assert.deepEqual(
      calls.map((e) => e.toolCallName),
      [expected],
    );
  });
}
