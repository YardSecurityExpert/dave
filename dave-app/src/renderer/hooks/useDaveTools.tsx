import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useState } from "react";
import { AmbiguousTaskForm } from "../components/Connections";
import type { MissionInput } from "../../shared/types";
function Draft({
  args,
  respond,
}: {
  args: MissionInput;
  respond: (value: unknown) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="da-card">
      <h3>Proposed focus</h3>
      <p>{args.mission}</p>
      <p>{args.currentStep}</p>
      {args.deadline && <p>Due {args.deadline}</p>}
      <button
        className="da-btn da-btn--primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await window.dave.setMission(args);
            await respond({ applied: true });
          } catch {
            setError("Could not apply this mission. Review it in Your focus.");
            setBusy(false);
          }
        }}
      >
        Use this mission
      </button>
      <button
        className="da-btn da-btn--ghost"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void respond({ applied: false });
        }}
      >
        Keep current focus
      </button>
      {error && (
        <p role="alert" className="da-error">
          {error}
        </p>
      )}
    </section>
  );
}
export function useDaveTools() {
  useHumanInTheLoop(
    {
      name: "draftAmbiguousTask",
      description:
        "Propose a task for the user to review and create in their connected Ambiguous workspace. This tool does not create anything until the user clicks Create in Ambiguous.",
      parameters: z.object({
        title: z.string().max(255),
        description: z.string().max(5000),
      }),
      render: (props) =>
        props.status === "executing" ? (
          <AmbiguousTaskForm
            title={props.args.title}
            description={props.args.description}
            onDone={(task) =>
              props.respond({ created: true, id: task.id, title: task.title })
            }
            onCancel={() => props.respond({ created: false })}
          />
        ) : (
          <p className="da-muted">
            {props.status === "complete"
              ? "Task proposal reviewed."
              : "Preparing task proposal…"}
          </p>
        ),
    },
    [],
  );
  useHumanInTheLoop(
    {
      name: "draftMission",
      description:
        "Propose a mission for the user to review before it is applied.",
      parameters: z.object({
        mission: z.string(),
        currentPriority: z.string(),
        currentStep: z.string(),
        nextAction: z.string().optional(),
        deadline: z.string().optional(),
      }),
      render: (props) =>
        props.status === "executing" ? (
          <Draft args={props.args} respond={props.respond} />
        ) : (
          <p className="da-muted">
            {props.status === "complete"
              ? "Mission proposal reviewed."
              : "Preparing a mission proposal…"}
          </p>
        ),
    },
    [],
  );
}
