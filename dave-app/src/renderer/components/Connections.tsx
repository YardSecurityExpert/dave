import { providerNames } from "../../shared/ai";
import { useEffect, useState } from "react";
import type { MissionState } from "../../shared/types";
import type { AmbiguousTask, ChromeChat } from "../../shared/integrations";
type Run = (action: () => Promise<unknown>, message?: string) => Promise<void>;
export function AmbiguousTaskForm({
  title = "",
  description = "",
  onDone,
  onCancel,
}: {
  title?: string;
  description?: string;
  onDone?: (task: AmbiguousTask) => unknown;
  onCancel?: () => unknown;
}) {
  const [draft, setDraft] = useState({
    requestId: crypto.randomUUID(),
    title,
    description,
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [task, setTask] = useState<AmbiguousTask>();
  return (
    <form
      className="da-card"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const result = await window.dave.createAmbiguousTask(draft);
          setTask(result);
          await onDone?.(result);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Task request failed.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Create an Ambiguous task</h3>
      <p className="da-muted">
        Only the title and description below go to your Ambiguous workspace. The
        task starts unassigned.
      </p>
      <label className="da-field">
        Title
        <input
          required
          maxLength={255}
          disabled={busy || !!task}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
      </label>
      <label className="da-field">
        Description
        <textarea
          maxLength={5000}
          disabled={busy || !!task}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </label>
      {error && (
        <p role="alert" className="da-error">
          {error}
        </p>
      )}
      {task ? (
        <p role="status" className="da-toast">
          Created: {task.title} · {task.status}
        </p>
      ) : (
        <button
          className="da-btn da-btn--primary"
          disabled={busy || !draft.title.trim()}
        >
          {busy ? "Creating…" : "Create in Ambiguous"}
        </button>
      )}
      {onCancel && !task && (
        <button
          type="button"
          className="da-btn da-btn--ghost"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onCancel();
            } catch {
              setError("Could not cancel the proposal.");
              setBusy(false);
            }
          }}
        >
          Cancel proposal
        </button>
      )}
    </form>
  );
}
function ChatCard({
  chat,
  state,
  run,
  busy,
}: {
  chat: ChromeChat;
  state: MissionState;
  run: Run;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(""),
    [showTask, setShowTask] = useState(false);
  const action = (action: "return" | "pin" | "park" | "share" | "unshare") =>
    void run(
      () => window.dave.chromeAction({ id: chat.id, action }),
      action === "pin" ? "Chat pinned as your mission." : "",
    );
  return (
    <article className="da-card">
      <h3>{chat.title}</h3>
      <p className="da-muted">
        {chat.responseState === "responding"
          ? "Response in progress"
          : "Response status unconfirmed"}{" "}
        · {chat.coverage}
      </p>
      <details>
        <summary>Review shared excerpt</summary>
        {chat.messages.map((m, i) => (
          <p key={i} className="da-excerpt">
            <strong>{m.role}</strong>
            <br />
            {m.text}
          </p>
        ))}
      </details>
      <div className="da-row da-wrap">
        <button
          className="da-btn da-btn--primary"
          disabled={busy}
          onClick={() => action("pin")}
        >
          Use as my mission
        </button>
        <button
          className="da-btn"
          disabled={busy}
          onClick={() => action("return")}
        >
          Return to chat
        </button>
        <button
          className="da-btn"
          disabled={busy}
          onClick={() => action("park")}
        >
          Save for later
        </button>
      </div>
      <p className="da-muted">
        Sharing with Ask Dave sends this chat's recent excerpt to {providerNames[state.settings.aiProvider]} when
        you ask for help. Background classification still uses window titles and
        URLs.
      </p>
      <button
        className="da-btn"
        disabled={busy}
        onClick={() =>
          action(state.chromeAiChatId === chat.id ? "unshare" : "share")
        }
      >
        {state.chromeAiChatId === chat.id
          ? "Stop sharing with Ask Dave"
          : "Use this chat in Ask Dave"}
      </button>
      <label className="da-field">
        Follow-up draft
        <textarea
          maxLength={4000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <button
        className="da-btn"
        disabled={busy || !draft.trim() || !chat.canDraft}
        onClick={() =>
          void run(
            () =>
              window.dave.chromeAction({
                id: chat.id,
                action: "draft",
                text: draft,
              }),
            "Draft inserted. Review and send it in ChatGPT.",
          )
        }
      >
        Insert into ChatGPT
      </button>
      <p className="da-muted">
        Dave preserves existing composer drafts and does not press Send.
      </p>
      {state.ambiguousConfigured && (
        <>
          <button className="da-btn" onClick={() => setShowTask(!showTask)}>
            Make an Ambiguous task
          </button>
          {showTask && (
            <AmbiguousTaskForm
              title={chat.title.slice(0, 255)}
              description={"Source: " + chat.url}
            />
          )}
        </>
      )}
    </article>
  );
}
export function Connections({
  state,
  run,
  busy,
}: {
  state: MissionState;
  run: Run;
  busy: boolean;
}) {
  const [apiKey, setApiKey] = useState(""),
    [tasks, setTasks] = useState<AmbiguousTask[]>([]),
    [newTask, setNewTask] = useState(false);
  useEffect(() => {
    setTasks([]);
  }, [state.ambiguousConfigured]);
  return (
    <div>
      <h2>Chrome + ChatGPT</h2>
      <p className="da-muted">
        Connect saved text conversations through the Dave toolbar button in
        Chrome. Excerpts stay on this Mac until you choose to share one with Ask
        Dave.
      </p>
      {state.chrome?.error && <p className="da-error">{state.chrome.error}</p>}
      <div className="da-row da-wrap">
        <button
          className="da-btn da-btn--primary"
          disabled={busy || state.demoMode}
          onClick={() =>
            void run(
              () => window.dave.installChrome(),
              "Chrome connection installed. Load the helper extension next.",
            )
          }
        >
          {state.chrome?.registered
            ? "Repair Chrome connection"
            : "Install Chrome connection"}
        </button>
        <button
          className="da-btn"
          onClick={() => void window.dave.showExtension()}
        >
          Show extension folder
        </button>
      </div>
      <p className="da-muted">
        In chrome://extensions, turn on Developer mode, choose Load unpacked,
        and select the helper folder. Then open a saved chat, click Dave,
        preview the excerpt, and connect.
      </p>
      <p className="da-muted">
        {state.chrome?.enabled
          ? "Ready for connected chats."
          : "Connection paused."}
      </p>
      {!state.chrome?.chats.length && (
        <p className="da-empty">No connected chats yet.</p>
      )}
      {state.chrome?.chats.map((chat) => (
        <ChatCard
          key={chat.id}
          chat={chat}
          state={state}
          run={run}
          busy={busy}
        />
      ))}
      <h2>Ambiguous AI</h2>
      <p className="da-muted">
        Connect your workspace to read recent tasks and create reviewed tasks.
        Your key stays encrypted on this Mac.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await window.dave.saveAmbiguousKey(apiKey);
            setApiKey("");
            setTasks([]);
          }, "Ambiguous key saved.");
        }}
      >
        <label className="da-field">
          Ambiguous API key
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              state.ambiguousConfigured ? "Key saved" : "Paste your API key"
            }
          />
        </label>
        <button className="da-btn" disabled={busy || !apiKey.trim()}>
          Save key
        </button>
        {state.ambiguousConfigured && (
          <button
            type="button"
            className="da-btn da-btn--ghost"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await window.dave.saveAmbiguousKey("");
                setTasks([]);
              }, "Ambiguous disconnected.")
            }
          >
            Disconnect Ambiguous
          </button>
        )}
      </form>
      {state.ambiguousConfigured && (
        <>
          <div className="da-row">
            <button
              className="da-btn"
              disabled={busy}
              onClick={() =>
                void run(async () =>
                  setTasks(await window.dave.listAmbiguousTasks()),
                )
              }
            >
              Load 25 recent tasks
            </button>
            <button className="da-btn" onClick={() => setNewTask(!newTask)}>
              New task
            </button>
          </div>
          {newTask && <AmbiguousTaskForm />}
          {tasks.map((task) => (
            <article className="da-commitment" key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <p className="da-muted">{task.status}</p>
              </div>
              <button
                className="da-btn"
                onClick={() =>
                  void run(() => window.dave.openAmbiguousTask(task.id))
                }
              >
                Open task
              </button>
            </article>
          ))}
        </>
      )}
      <p className="da-muted">
        CopilotKit powers Ask Dave, mission proposals, and task proposal cards.
        Chrome and Ambiguous remain separate connections.
      </p>
    </div>
  );
}
