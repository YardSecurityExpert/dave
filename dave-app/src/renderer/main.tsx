import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import "../../design/tokens/tokens.css";
import "../../design/css/components.css";
import "./styles/copilotkit-overrides.css";
import { App } from "./App";
import type { MissionState } from "../shared/types";
function Root({ initial }: { initial: MissionState }) {
  const [state, setState] = useState(initial);
  useEffect(() => {
    const off = window.dave.onState(setState);
    void window.dave.getState().then(setState);
    return off;
  }, []);
  if (!state.runtimeReady) return <App state={state} />;
  return (
    <CopilotKitProvider
      key={state.runtimeUrl}
      runtimeUrl={state.runtimeUrl}
      headers={
        state.runtimeToken
          ? { Authorization: "Bearer " + state.runtimeToken }
          : undefined
      }
      agentId="dave"
      enableInspector={false}
    >
      <App state={state} />
    </CopilotKitProvider>
  );
}
window.dave.getState().then((state) => {
  createRoot(document.getElementById("root")!).render(<Root initial={state} />);
});
