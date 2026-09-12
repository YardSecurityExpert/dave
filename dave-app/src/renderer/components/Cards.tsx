import type {
  Decision,
  Mission,
  Intervention,
  Choice,
} from "../../shared/types";
import mascot from "../../../assets/dave.png";
export type { Choice } from "../../shared/types";
export function Dave({ pose: _pose }: { pose?: string }) {
  return <img className="da-mascot" src={mascot} alt="" draggable={false} />;
}
export function MissionCard({ mission }: { mission?: Partial<Mission> }) {
  return (
    <section className="da-card da-card--hero">
      <Dave />
      <p className="da-caption">Your focus</p>
      <h1>{mission?.mission || "A little space to focus."}</h1>
      <p className="da-muted">{mission?.currentPriority}</p>
      <div className="da-step">
        <p className="da-caption">Right now</p>
        <p>{mission?.currentStep}</p>
        {mission?.nextAction && (
          <p className="da-muted">Next: {mission.nextAction}</p>
        )}
      </div>
      {mission?.deadline && (
        <p className="da-muted">
          Due{" "}
          {new Date(mission.deadline).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </section>
  );
}
export function RecoveryCard({ nextAction }: { nextAction?: string }) {
  return (
    <div className="da-toast" role="status">
      <strong>Back to what matters.</strong>
      <p>{nextAction}</p>
    </div>
  );
}
export function ParkedCard({ title }: { title?: string; synced?: boolean }) {
  return (
    <div className="da-toast" role="status">
      <strong>Saved for later.</strong>
      <p>{title}</p>
      <p className="da-muted">Saved on this Mac.</p>
    </div>
  );
}
export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="da-toast" role="status">
      {children}
    </div>
  );
}
export function FencePanel({
  decision: d,
  onChoose,
  busy,
}: {
  decision: Decision & Partial<Intervention>;
  onChoose: (choice: Choice) => Promise<void>;
  busy: boolean;
}) {
  const departure = d.kind === "departure";
  return (
    <section className="da-fence-panel" aria-label="Focus reminder">
      <Dave />
      <p className="da-caption">
        {d.kind === "preview"
          ? "Preview · simulated activity"
          : departure
            ? "Room for the rest of your life"
            : "A little nudge from Dave"}
      </p>
      <h1>
        {departure ? "Time for " + d.site + "?" : "Back to what matters?"}
      </h1>
      <p>{d.reason}</p>
      {d.minutesLeft !== null && (
        <p className="da-deadline">
          {d.minutesLeft} minutes{" "}
          {departure ? "until you leave" : "until your deadline"}
        </p>
      )}
      <div className="da-step">
        <p className="da-caption">Your next step</p>
        <p>{d.unfinished}</p>
      </div>
      <div className="da-actions">
        <button
          className="da-btn da-btn--primary"
          disabled={busy || !d.recovery.bundleId}
          onClick={() => void onChoose("recover")}
        >
          Return to work
        </button>
        {!d.recovery.bundleId && (
          <p className="da-muted">
            Pin a work window in Your focus to enable return.
          </p>
        )}
        {d.parkingCandidate && (
          <button
            className="da-btn"
            disabled={busy}
            onClick={() => void onChoose("park")}
          >
            Save this idea for later
          </button>
        )}
        {d.kind === "drift" && (
          <button
            className="da-btn da-btn--ghost"
            disabled={busy}
            onClick={() => void onChoose("correct")}
          >
            This belongs to my mission
          </button>
        )}
        <button
          className="da-btn da-btn--ghost"
          disabled={busy}
          onClick={() => void onChoose("snooze")}
        >
          {d.kind === "drift" ? "Snooze for 10 minutes" : "Dismiss"}
        </button>
      </div>
    </section>
  );
}
