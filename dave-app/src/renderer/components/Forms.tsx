import { useEffect, useState } from "react";
import type { Commitment, MissionState, ParkedIdea } from "../../shared/types";
import { defaultModels, providerNames, type AIProvider } from "../../shared/ai";
export function localInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export type Run = (
  action: () => Promise<unknown>,
  success?: string,
) => Promise<void>;
export function MissionForm({
  state,
  run,
  done,
  busy,
}: {
  state: MissionState;
  run: Run;
  done: () => void;
  busy: boolean;
}) {
  return (
    <form
      className="da-fields"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        void run(async () => {
          await window.dave.setMission({
            mission: String(f.get("mission")),
            currentPriority:
              String(f.get("priority")) || String(f.get("mission")),
            currentStep: String(f.get("step")),
            nextAction: String(f.get("next")) || undefined,
            deadline: f.get("deadline")
              ? new Date(String(f.get("deadline"))).toISOString()
              : undefined,
          });
          done();
        }, "Your focus is saved.");
      }}
    >
      <h2>
        {state.mission
          ? "Choose your next step."
          : "What would you like to finish?"}
      </h2>
      <label>
        Your mission
        <input
          name="mission"
          maxLength={4000}
          required
          defaultValue={state.mission}
          placeholder="Finish the dashboard findings"
        />
      </label>
      <label>
        Why it matters <span className="da-muted">(optional)</span>
        <input
          name="priority"
          maxLength={4000}
          defaultValue={state.currentPriority}
          placeholder="Help Caroline prepare for her call"
        />
      </label>
      <label>
        Right now
        <input
          name="step"
          maxLength={4000}
          required
          defaultValue={state.currentStep}
          placeholder="Review the activation chart"
        />
      </label>
      <label>
        Next small action <span className="da-muted">(optional)</span>
        <input
          name="next"
          maxLength={4000}
          defaultValue={state.nextAction}
          placeholder="Write the three findings"
        />
      </label>
      <label>
        Deadline <span className="da-muted">(optional)</span>
        <input
          name="deadline"
          type="datetime-local"
          defaultValue={localInput(state.deadline)}
        />
      </label>
      <div className="da-row">
        <button className="da-btn da-btn--primary" disabled={busy}>
          Let's focus
        </button>
        {state.mission && (
          <button type="button" className="da-btn da-btn--ghost" onClick={done}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
export function CommitmentForm({
  value,
  run,
  done,
  busy,
}: {
  value?: Commitment;
  run: Run;
  done: () => void;
  busy: boolean;
}) {
  return (
    <form
      className="da-fields da-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        void run(async () => {
          await window.dave.saveCommitment({
            id: value?.id,
            title: String(f.get("title")),
            startsAt: new Date(String(f.get("startsAt"))).toISOString(),
            travelMinutes: Number(f.get("travel")),
          });
          done();
        }, "Commitment saved.");
      }}
    >
      <h3>{value ? "Edit commitment" : "Make room for your plans"}</h3>
      <label>
        What's coming up?
        <input
          name="title"
          maxLength={4000}
          required
          defaultValue={value?.title}
          placeholder="Padel with Theresa"
        />
      </label>
      <label>
        Starts at
        <input
          type="datetime-local"
          name="startsAt"
          required
          defaultValue={localInput(value?.startsAt)}
        />
      </label>
      <label>
        Minutes to get there
        <input
          type="number"
          name="travel"
          min="0"
          max="1440"
          required
          defaultValue={value?.travelMinutes ?? 30}
        />
      </label>
      <p className="da-muted">
        Dave will remind you five minutes before you need to leave. Enter your
        own travel allowance.
      </p>
      <div className="da-row">
        <button className="da-btn da-btn--primary" disabled={busy}>
          Save commitment
        </button>
        <button className="da-btn da-btn--ghost" type="button" onClick={done}>
          Cancel
        </button>
      </div>
    </form>
  );
}
export function Ideas({
  state,
  run,
  busy,
}: {
  state: MissionState;
  run: Run;
  busy: boolean;
}) {
  const [editing, setEditing] = useState<ParkedIdea | "new">();
  if (editing) {
    const idea = editing === "new" ? undefined : editing;
    return (
      <form
        className="da-fields"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void run(async () => {
            const title = String(f.get("title")),
              note = String(f.get("note")) || undefined;
            const when = f.get("when")
              ? new Date(String(f.get("when"))).toISOString()
              : undefined;
            if (idea)
              await window.dave.updateIdea({
                id: idea.id,
                title,
                note,
                when: when || idea.when,
                completed: f.has("completed"),
              });
            else
              await window.dave.park({
                title,
                note,
                when,
                url: String(f.get("url")) || undefined,
              });
            setEditing(undefined);
          }, "Idea saved.");
        }}
      >
        <h2>{idea ? "Your saved idea" : "Save a side idea"}</h2>
        <label>
          Title
          <input
            name="title"
            maxLength={4000}
            required
            defaultValue={idea?.title}
          />
        </label>
        {!idea && (
          <label>
            Web link <span className="da-muted">(optional)</span>
            <input type="url" name="url" placeholder="https://" />
          </label>
        )}
        <label>
          Note
          <textarea name="note" maxLength={4000} defaultValue={idea?.note} />
        </label>
        <label>
          Revisit at{" "}
          <span className="da-muted">(defaults to tomorrow, 10:00)</span>
          <input
            type="datetime-local"
            name="when"
            defaultValue={localInput(idea?.when)}
          />
        </label>
        {idea && (
          <label className="da-check">
            <input
              type="checkbox"
              name="completed"
              defaultChecked={!!idea.completedAt}
            />
            Completed
          </label>
        )}
        <div className="da-row">
          <button className="da-btn da-btn--primary" disabled={busy}>
            Save idea
          </button>
          <button
            className="da-btn da-btn--ghost"
            type="button"
            onClick={() => setEditing(undefined)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }
  return (
    <>
      <div className="da-section-title">
        <h2>For another moment.</h2>
        <button className="da-btn" onClick={() => setEditing("new")}>
          Save an idea
        </button>
      </div>
      {!state.parkedIdeas.length && (
        <p className="da-muted">
          Your side ideas can wait here while you finish your focus.
        </p>
      )}
      {[...state.parkedIdeas].reverse().map((idea) => (
        <article className="da-card" key={idea.id}>
          <h3>{idea.title}</h3>
          {idea.note && <p>{idea.note}</p>}
          <p className="da-muted">
            {idea.completedAt
              ? "Completed"
              : new Date(idea.when).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
          </p>
          <div className="da-row">
            {idea.url && (
              <button
                className="da-btn"
                disabled={busy}
                onClick={() => void run(() => window.dave.openIdea(idea.id))}
              >
                Open link
              </button>
            )}
            <button
              className="da-btn da-btn--ghost"
              onClick={() => setEditing(idea)}
            >
              Edit
            </button>
            <button
              className="da-btn da-btn--ghost"
              disabled={busy}
              onClick={() =>
                void run(() => window.dave.deleteIdea(idea.id), "Idea removed.")
              }
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </>
  );
}
export function SettingsForm({
  state,
  run,
  busy,
}: {
  state: MissionState;
  run: Run;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(state.settings);
  const [apiKey, setApiKey] = useState("");
  useEffect(() => setApiKey(""), [state.settings.aiProvider]);
  const toggle = (
    field:
      | "trackingEnabled"
      | "aiEnabled"
      | "automaticNudges"
      | "chromeEnabled"
      | "safariEnabled"
      | "startAtLogin",
    label: string,
  ) => (
    <label className="da-check">
      <input
        type="checkbox"
        checked={draft[field]}
        onChange={(e) => setDraft({ ...draft, [field]: e.target.checked })}
      />
      {label}
    </label>
  );
  return (
    <div className="da-fields">
      <h2>Make Dave yours.</h2>
      <form
        className="da-fields"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () =>
              window.dave.saveSettings({
                ...draft,
                excludedApps: draft.excludedApps
                  .map((v) => v.trim())
                  .filter(Boolean),
                excludedDomains: draft.excludedDomains
                  .map((v) => v.trim().toLowerCase())
                  .filter(Boolean),
              }),
            "Settings saved.",
          );
        }}
      >
        <fieldset>
          <legend>Activity access</legend>
          {toggle("trackingEnabled", "Notice my active app and window")}
          <p className="da-muted">
            Only during a mission. Dave pauses collection when you are idle or
            your screen is locked. No screenshots, clipboard, or page contents.
          </p>
          <button
            type="button"
            className="da-btn"
            onClick={() => void run(() => window.dave.requestAccessibility())}
          >
            Allow Accessibility…
          </button>
          {toggle("chromeEnabled", "Include Chrome tab titles and URLs")}
          <p className="da-muted">Incognito windows are skipped.</p>
          {toggle("safariEnabled", "Include Safari tab titles and URLs")}
          <p className="da-muted">
            Safari private windows cannot be reliably identified. Keep this off
            when browsing privately. Arc, Brave, Edge, and Firefox are skipped.
          </p>
          <label>
            Excluded apps{" "}
            <span className="da-muted">
              (one app name or bundle ID per line)
            </span>
            <textarea
              value={draft.excludedApps.join("\n")}
              onChange={(e) =>
                setDraft({ ...draft, excludedApps: e.target.value.split("\n") })
              }
            />
          </label>
          <label>
            Excluded domains{" "}
            <span className="da-muted">
              (one per line, including subdomains)
            </span>
            <textarea
              value={draft.excludedDomains.join("\n")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  excludedDomains: e.target.value.split("\n"),
                })
              }
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>AI and nudges</legend>
          <label>
            AI provider
            <select value={draft.aiProvider} onChange={(e) => {
              const provider = e.target.value as AIProvider;
              setDraft({ ...draft, aiProvider: provider, aiModel: defaultModels[provider] });
              setApiKey("");
            }}>
              <option value="openai">OpenAI</option>
              <option value="featherless">Featherless</option>
            </select>
          </label>
          <label>
            Model
            <input required value={draft.aiModel} maxLength={200} onChange={(e) => setDraft({ ...draft, aiModel: e.target.value })} />
          </label>
          {toggle("aiEnabled", "Use " + providerNames[draft.aiProvider] + " for classification and Ask Dave")}
          <p className="da-muted">
            Sends your mission and the current app, title, and web address to
            {providerNames[draft.aiProvider]}. Query strings and fragments are removed. API usage is billed
            to your key. Ask Dave sends the mission, commitments, and messages
            you enter.
          </p>
          {toggle("automaticNudges", "Try automatic focus nudges")}
          <p className="da-muted">
            Experimental; off by default while accuracy is being evaluated.
            Requires activity access, AI, and an API key.
          </p>
          <label>
            Daily classification request limit
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={draft.dailyRequestLimit}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  dailyRequestLimit: Number(e.target.value),
                })
              }
            />
          </label>
          <p className="da-muted">
            {state.usage.requests} classification requests today ·{" "}
            {state.usage.tokens} reported tokens. Chat is separate from this
            limit.
          </p>
        </fieldset>
        {toggle("startAtLogin", "Start Dave when I log in")}
        <button className="da-btn da-btn--primary" disabled={busy}>
          Save settings
        </button>
      </form>
      <form
        className="da-fields da-card"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            async () => {
              await window.dave.saveApiKey(apiKey, state.settings.aiProvider);
              setApiKey("");
            },
            apiKey ? "API key saved." : "Saved API key removed.",
          );
        }}
      >
        <h3>{providerNames[state.settings.aiProvider]} API key</h3>
        {draft.aiProvider !== state.settings.aiProvider && <p className="da-muted">Save settings above to switch providers before adding the new key.</p>}
        <p className="da-muted">
          {state.apiKeyConfigured
            ? "A key is configured."
            : "No key is configured."}{" "}
          Stored encrypted using macOS credential storage.
        </p>
        <label>
          API key
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={state.settings.aiProvider === "openai" ? "sk-…" : "Featherless API key"}
            disabled={draft.aiProvider !== state.settings.aiProvider}
          />
        </label>
        <div className="da-row">
          <button className="da-btn" disabled={busy || !apiKey || draft.aiProvider !== state.settings.aiProvider}>
            Save key
          </button>
          {state.apiKeyConfigured && (
            <button
              type="button"
              className="da-btn da-btn--ghost"
              disabled={busy}
              onClick={() =>
                void run(
                  () => window.dave.saveApiKey("", state.settings.aiProvider),
                  "API key removed.",
                )
              }
            >
              Remove key
            </button>
          )}
        </div>
      </form>
      <section className="da-card">
        <h3>On this Mac</h3>
        <p className="da-muted">
          The last 30 activity segments stay in memory. Your mission, pinned
          work, corrections, commitments, and saved ideas persist locally.
        </p>
        <button
          className="da-btn"
          disabled={busy}
          onClick={() =>
            void run(
              () => window.dave.clearHistory(),
              "Activity history, pinned work, and corrections cleared.",
            )
          }
        >
          Clear activity history
        </button>
      </section>
    </div>
  );
}
