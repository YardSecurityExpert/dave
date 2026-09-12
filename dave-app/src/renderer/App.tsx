import { useEffect, useState } from "react";
import type { Commitment, MissionState } from "../shared/types";
import { Dave, MissionCard, FencePanel } from "./components/Cards";
import {
  CommitmentForm,
  Ideas,
  MissionForm,
  SettingsForm,
} from "./components/Forms";
import { AgentChat } from "./hooks/AgentChat";
import { Connections } from "./components/Connections";
export function App({ state }: { state: MissionState }) {
  const [tab, setTab] = useState<
    "focus" | "ideas" | "chat" | "settings" | "connections"
  >("focus");
  const [editing, setEditing] = useState(!state.mission);
  useEffect(() => {
    if (state.mission) setEditing(false);
  }, [state.mission]);
  const [commitment, setCommitment] = useState<Commitment | "new">();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const paused = state.pausedUntil > Date.now();
  async function run(action: () => Promise<unknown>, success = "") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message.replace(
              /^Error invoking remote method '[^']+': Error: /,
              "",
            )
          : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (state.intervention)
        void run(() =>
          window.dave.choose({ id: state.intervention!.id, choice: "snooze" }),
        );
      else window.dave.hide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.intervention]);
  return (
    <main className="da-shell">
      <header className="da-header">
        <span className="da-wordmark">
          dave<span>·</span>
        </span>
        <span className="da-chip">
          {state.demoMode
            ? "Demo"
            : paused
              ? "Paused"
              : state.completedAt
                ? "Complete"
                : state.settings.aiEnabled && state.apiKeyConfigured
                  ? "AI enabled"
                  : "On your Mac"}
        </span>
        <button
          className="da-close"
          aria-label="Hide Dave"
          onClick={() => window.dave.hide()}
        >
          ×
        </button>
      </header>
      {error && (
        <p className="da-error da-banner" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="da-toast" role="status">
          {message}
        </p>
      )}
      {state.storageWarning && (
        <p className="da-error" role="alert">
          {state.storageWarning}
        </p>
      )}
      {state.intervention ? (
        <FencePanel
          decision={state.intervention}
          busy={busy}
          onChoose={(choice) =>
            run(() =>
              window.dave.choose({ id: state.intervention!.id, choice }),
            )
          }
        />
      ) : (
        <>
          <nav className="da-tabs" aria-label="Views">
            {(
              ["focus", "ideas", "chat", "connections", "settings"] as const
            ).map((view) => (
              <button
                key={view}
                className={
                  "da-btn " +
                  (tab === view ? "da-btn--selected" : "da-btn--ghost")
                }
                aria-current={tab === view ? "page" : undefined}
                onClick={() => {
                  setTab(view);
                  setMessage("");
                  setError("");
                }}
              >
                {
                  {
                    focus: "Your focus",
                    ideas: "Saved ideas",
                    chat: "Ask Dave",
                    settings: "Settings",
                    connections: "Connect",
                  }[view]
                }
              </button>
            ))}
          </nav>
          {tab === "focus" && (
            <>
              {editing ? (
                <>
                  <div className="da-center">
                    <Dave />
                    <p className="da-muted">
                      For the things you meant to finish.
                    </p>
                  </div>
                  <MissionForm
                    state={state}
                    run={run}
                    busy={busy}
                    done={() => setEditing(false)}
                  />
                </>
              ) : (
                <>
                  <MissionCard mission={state} />
                  {state.completedAt ? (
                    <div className="da-toast">
                      <strong>Work wrapped up.</strong>
                      <p>Make room for the rest of your day.</p>
                    </div>
                  ) : (
                    <div className="da-row da-wrap">
                      <button
                        className="da-btn da-btn--primary"
                        disabled={busy || !state.recovery}
                        onClick={() =>
                          void run(
                            () => window.dave.recover(),
                            "Your work is ready.",
                          )
                        }
                      >
                        Return to work
                      </button>
                      {paused ? (
                        <button
                          className="da-btn"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () => window.dave.resume(),
                              "Dave resumed.",
                            )
                          }
                        >
                          Resume
                        </button>
                      ) : (
                        <>
                          <button
                            className="da-btn"
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => window.dave.pause("15m"),
                                "Paused for 15 minutes.",
                              )
                            }
                          >
                            Pause 15 min
                          </button>
                          <button
                            className="da-btn da-btn--ghost"
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => window.dave.pause("today"),
                                "Paused until tomorrow.",
                              )
                            }
                          >
                            Pause today
                          </button>
                        </>
                      )}
                      <button
                        className="da-btn da-btn--ghost"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => window.dave.completeMission(),
                            "Mission complete.",
                          )
                        }
                      >
                        Complete mission
                      </button>
                    </div>
                  )}
                  <section className="da-work">
                    <p className="da-caption">Your work destination</p>
                    <p>
                      {state.recovery
                        ? state.recovery.title || state.recovery.app
                        : "Pin the window you want to return to."}
                    </p>
                    {!state.settings.trackingEnabled && (
                      <p className="da-muted">
                        Enable activity access in Settings, open your work, then
                        return here.
                      </p>
                    )}
                    <button
                      className="da-btn"
                      disabled={busy || !state.trail.length}
                      onClick={() =>
                        void run(
                          () => window.dave.pinRecovery(),
                          "Work destination pinned.",
                        )
                      }
                    >
                      Pin last active window
                    </button>
                    <button
                      className="da-btn da-btn--ghost"
                      onClick={() => setEditing(true)}
                    >
                      {state.completedAt
                        ? "Start a new mission"
                        : "Edit mission"}
                    </button>
                  </section>
                  <div className="da-section-title">
                    <h2>The rest of your day</h2>
                    <button
                      className="da-btn da-btn--ghost"
                      onClick={() => setCommitment("new")}
                    >
                      Add a plan
                    </button>
                  </div>
                  {commitment && (
                    <CommitmentForm
                      value={commitment === "new" ? undefined : commitment}
                      run={run}
                      busy={busy}
                      done={() => setCommitment(undefined)}
                    />
                  )}
                  {!state.commitments.length && !commitment && (
                    <p className="da-muted">
                      A call, dinner, padel. Keep time for what comes next.
                    </p>
                  )}
                  {[...state.commitments]
                    .sort(
                      (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
                    )
                    .map((c) => (
                      <article className="da-commitment" key={c.id}>
                        <div>
                          <strong>{c.title}</strong>
                          <p className="da-muted">
                            {new Date(c.startsAt).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}{" "}
                            · leave{" "}
                            {new Date(
                              Date.parse(c.startsAt) - c.travelMinutes * 60000,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="da-row">
                          <button
                            className="da-btn da-btn--ghost"
                            onClick={() => setCommitment(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="da-btn da-btn--ghost"
                            disabled={busy}
                            onClick={() =>
                              void run(() => window.dave.deleteCommitment(c.id))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    ))}
                </>
              )}
              <footer className="da-info">
                <p className="da-muted">{state.watcherStatus}</p>
                {state.settings.aiEnabled && (
                  <p className="da-muted">{state.classifierStatus}</p>
                )}
                <button
                  className="da-btn da-btn--ghost"
                  onClick={() => window.dave.simulateDrift()}
                >
                  Preview a gentle nudge ↗
                </button>
              </footer>
            </>
          )}
          {tab === "ideas" && <Ideas state={state} run={run} busy={busy} />}
          {tab === "connections" && (
            <Connections state={state} run={run} busy={busy} />
          )}
          {tab === "settings" && (
            <SettingsForm state={state} run={run} busy={busy} />
          )}
          {tab === "chat" &&
            (state.runtimeReady ? (
              <AgentChat state={state} />
            ) : (
              <div className="da-empty">
                <Dave />
                <h2>Your next step stays close.</h2>
                <p>{state.currentStep || "Choose a mission to begin."}</p>
                <p className="da-muted">
                  {paused
                    ? "Ask Dave is paused."
                    : "Enable AI and add your provider key in Settings to chat."}
                </p>
                <button className="da-btn" onClick={() => setTab("settings")}>
                  Open Settings
                </button>
              </div>
            ))}
        </>
      )}
    </main>
  );
}
