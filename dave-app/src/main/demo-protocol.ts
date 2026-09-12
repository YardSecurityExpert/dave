import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { randomUUID } from "node:crypto";
import type { Decision, Mission } from "../shared/types";

// Deterministic AG-UI transport fixture. No model calls or external services.
export function demoEvents(input: RunAgentInput): BaseEvent[] {
  const events: BaseEvent[] = [
    {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    },
  ];
  const emitTool = (toolCallName: string, args: unknown) => {
    const toolCallId = randomUUID();
    events.push(
      { type: EventType.TOOL_CALL_START, toolCallId, toolCallName },
      {
        type: EventType.TOOL_CALL_ARGS,
        toolCallId,
        delta: JSON.stringify(args),
      },
      { type: EventType.TOOL_CALL_END, toolCallId },
    );
  };
  const say = (delta: string) => {
    const messageId = randomUUID();
    events.push(
      { type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" },
      { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta },
      { type: EventType.TEXT_MESSAGE_END, messageId },
    );
  };
  const missionContext = input.context.find((c) =>
    c.description.startsWith("Current mission"),
  );
  let mission: Partial<Mission> = {};
  try {
    mission = JSON.parse(missionContext?.value || "{}");
  } catch {}
  const last = input.messages.at(-1);
  const driftMessage = [...input.messages]
    .reverse()
    .find(
      (m) =>
        m.role === "user" &&
        typeof m.content === "string" &&
        m.content.startsWith("ACTIVITY_DRIFT "),
    );
  let drift: Decision | undefined;
  try {
    if (driftMessage && typeof driftMessage.content === "string")
      drift = JSON.parse(driftMessage.content.slice("ACTIVITY_DRIFT ".length));
  } catch {}
  if (last?.role === "tool") {
    const call = input.messages
      .flatMap((m) => (m.role === "assistant" ? m.toolCalls || [] : []))
      .find((c) => c.id === last.toolCallId);
    if (call?.function.name === "driftInterrupt" && drift) {
      let choice = "";
      try {
        choice = JSON.parse(last.content).choice;
      } catch {}
      if (choice === "recover")
        emitTool("recover", {
          ...drift.recovery,
          nextAction:
            mission.nextAction || mission.currentStep || drift.unfinished,
          summary: "Return to your next step.",
        });
      else if (choice === "park")
        emitTool("parkIdea", { title: drift.parkingTitle || drift.site });
      else if (choice === "correct")
        emitTool("correct", {
          domainOrApp: drift.site,
          note: "Research for this mission",
        });
      else say("Choose how to handle this rabbit hole.");
    } else {
      events.push({
        type: EventType.STATE_SNAPSHOT,
        snapshot: {
          classification: "on_track",
          confidence: 1,
          reason: "Your next step is waiting.",
        },
      });
      say("Your next step is waiting.");
    }
  } else if (last?.role === "user" && typeof last.content === "string") {
    if (last.content.startsWith("ACTIVITY_DRIFT ") && drift) {
      events.push({
        type: EventType.STATE_SNAPSHOT,
        snapshot: {
          classification: "distracted",
          confidence: 1,
          reason: drift.reason,
        },
      });
      emitTool("driftInterrupt", drift);
    } else if (last.content === "CLASSIFY") {
      events.push({
        type: EventType.STATE_SNAPSHOT,
        snapshot: {
          classification: "uncertain",
          confidence: 0,
          reason: "Demo mode uses simulated activity.",
        },
      });
      say("Demo mode uses simulated activity.");
    } else
      say(
        mission.currentStep
          ? `${mission.currentStep}${mission.nextAction ? `. Next: ${mission.nextAction}` : ""}`
          : "Set your mission to choose your next step.",
      );
  }
  events.push({
    type: EventType.RUN_FINISHED,
    threadId: input.threadId,
    runId: input.runId,
  });
  return events;
}
