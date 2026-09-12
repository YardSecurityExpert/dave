import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useState } from "react";
import { providerNames } from "../../shared/ai";
import { aiErrorMessage } from "../../shared/ai-errors";
import type { MissionState } from "../../shared/types";
import { useAgentContexts } from "./useAgentContexts";
import { useDaveTools } from "./useDaveTools";
export function AgentChat({ state }: { state: MissionState }) {
  useAgentContexts(state);
  useDaveTools();
  const { agent, isReady } = useAgent({ agentId: "dave" });
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isReady) return;
    let receivedOutput = false;
    const subscription = agent.subscribe({
      onRunInitialized: () => { receivedOutput = false; setError(""); },
      onTextMessageContentEvent: () => { receivedOutput = true; },
      onToolCallStartEvent: () => { receivedOutput = true; },
      onRunErrorEvent: ({ event }) => { setError(aiErrorMessage(event.message)); },
      onRunFailed: ({ error }) => { setError(aiErrorMessage(error)); },
      onRunFinishedEvent: () => {
        if (!receivedOutput) setError((current) => current || "The model returned no answer. Try again or choose another model in Settings.");
      },
    });
    return () => subscription.unsubscribe();
  }, [agent, isReady]);
  return (
    <>
      <p className="da-muted">{providerNames[state.settings.aiProvider]} · {state.settings.aiModel}</p>
      {error && <p role="alert" className="da-error">{error}</p>}
      <div className="da-chat">
        <CopilotChat agentId="dave" />
      </div>
    </>
  );
}
