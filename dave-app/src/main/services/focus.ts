import { randomUUID } from "node:crypto";
import type {
  AgentState,
  Choice,
  Intervention,
  MissionState,
  Recovery,
  TrailEvent,
} from "../../shared/types";
import {
  activityKey,
  decisionFor,
  excluded,
  isCorrected,
  mergeTrail,
  recoveryFrom,
  safeUrl,
  shouldInterrupt,
  siteOf,
  upcomingCommitments,
} from "../policy";
import {
  commitmentInput,
  date,
  ideaInput,
  localDay,
  missionInput,
  settingsSchema,
  text,
} from "../storage/state";
import { z } from "zod";
import { ClassificationScheduler } from "./scheduler";
import { snapshotFor, type Classifier } from "./classifier";
export class FocusService {
  readonly scheduler: ClassificationScheduler;
  private currentId?: string;
  private currentKey?: string;
  private contextSince = 0;
  private lastObservation = 0;
  private notifiedEpisode?: string;
  private actionRunning = false;
  private applied = new Set<string>();
  constructor(
    readonly state: MissionState,
    private ports: {
      save: () => void;
      publish: () => void;
      interrupt: () => void;
      dismiss: () => void;
      recover: (target: Recovery) => Promise<void>;
      openUrl: (url: string) => Promise<void>;
      classify: Classifier;
      clock?: () => number;
    },
  ) {
    this.scheduler = new ClassificationScheduler(ports.classify, () =>
      this.now(),
    );
  }
  private now() {
    return this.ports.clock?.() ?? Date.now();
  }
  private commit() {
    this.ports.save();
    this.ports.publish();
  }
  private resetAgent() {
    this.state.agent = {
      classification: "uncertain",
      confidence: 0,
      reason: "Waiting for activity context.",
    };
  }
  invalidate(clearIntervention = true) {
    this.scheduler.cancel();
    this.currentId = undefined;
    this.currentKey = undefined;
    this.lastObservation = 0;
    this.contextSince = this.now();
    this.resetAgent();
    if (clearIntervention) {
      this.state.intervention = undefined;
      this.ports.dismiss();
    }
  }
  canObserve() {
    return (
      !this.state.demoMode &&
      !!this.state.mission &&
      !this.state.completedAt &&
      this.state.pausedUntil <= this.now() &&
      this.state.settings.trackingEnabled
    );
  }
  setMission(input: unknown) {
    const mission = missionInput.parse(input);
    this.invalidate();
    Object.assign(this.state, mission, {
      nextAction: mission.nextAction,
      deadline: mission.deadline,
      deadlineSource: mission.deadline ? "user" : undefined,
      missionRevision: this.state.missionRevision + 1,
      completedAt: undefined,
      trail: [],
      corrections: [],
      recovery: undefined,
      pausedUntil: 0,
      stats: { interrupts: 0, recoveries: 0, parked: 0 },
    });
    this.commit();
    return this.state;
  }
  pause(until: unknown) {
    z.enum(["15m", "today"]).parse(until);
    const end = new Date(this.now());
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
    this.state.pausedUntil =
      until === "15m" ? this.now() + 15 * 60000 : end.getTime();
    this.invalidate();
    this.state.watcherStatus = "Paused";
    this.commit();
  }
  resume() {
    this.state.pausedUntil = 0;
    this.invalidate();
    this.commit();
  }
  complete() {
    this.state.completedAt = new Date(this.now()).toISOString();
    this.invalidate();
    this.state.watcherStatus = "Mission complete";
    this.commit();
  }
  saveSettings(input: unknown) {
    this.state.settings = settingsSchema.parse(input);
    this.invalidate();
    // New exclusions remove any previously retained context immediately.
    this.state.trail = this.state.trail.filter(
      (event) => !excluded(event, this.state.settings),
    );
    if (
      this.state.recovery &&
      excluded(
        {
          app: this.state.recovery.app || "",
          bundleId: this.state.recovery.bundleId,
          url: this.state.recovery.urls[0],
          title: "",
          ts: 0,
          dwellSec: 0,
        },
        this.state.settings,
      )
    )
      this.state.recovery = undefined;
    this.commit();
  }
  unavailable(status: string, keepIntervention = false) {
    if (this.currentId)
      this.invalidate(
        !keepIntervention && this.state.intervention?.kind !== "departure",
      );
    this.state.watcherStatus = status;
    this.ports.publish();
  }
  observe(input: TrailEvent) {
    if (!this.canObserve()) return;
    const event = { ...input, url: safeUrl(input.url) };
    if (excluded(event, this.state.settings)) {
      this.unavailable("Excluded activity");
      return;
    }
    const now = this.now();
    const key = activityKey(event);
    const changed = this.currentKey !== key;
    if (changed) {
      this.invalidate(this.state.intervention?.kind !== "departure");
      this.currentId = randomUUID();
      this.currentKey = key;
      this.contextSince = now;
      this.notifiedEpisode = undefined;
    }
    event.id = this.currentId;
    event.ts = now;
    event.dwellSec =
      this.lastObservation && !changed
        ? Math.min(4, Math.max(0, (now - this.lastObservation) / 1000))
        : 0;
    this.lastObservation = now;
    event.classification = this.state.agent.classification;
    this.state.trail = mergeTrail(this.state.trail, event);
    this.state.watcherStatus = "Noticing your active window";
    if (isCorrected(this.state, event)) {
      this.state.agent = {
        classification: "on_track",
        confidence: 1,
        reason: "You marked this activity as relevant.",
      };
      this.state.trail.at(-1)!.classification = "on_track";
    }
    this.evaluate();
    this.ports.publish();
    if (
      !this.state.settings.aiEnabled ||
      !this.state.apiKeyConfigured ||
      isCorrected(this.state, event) ||
      !event.title ||
      now - this.contextSince < 10000
    )
      return;
    if (this.state.usage.day !== localDay(now))
      this.state.usage = { day: localDay(now), requests: 0, tokens: 0 };
    if (this.state.usage.requests >= this.state.settings.dailyRequestLimit) {
      this.state.classifierStatus = "Daily classification limit reached";
      return;
    }
    const snapshot = snapshotFor(this.state, event, randomUUID());
    void this.scheduler.offer(snapshot, {
      started: () => {
        this.state.usage.requests++;
        this.state.classifierStatus = "Checking this step…";
        this.commit();
      },
      usage: (tokens) => {
        this.state.usage.tokens += tokens;
        this.commit();
      },
      result: (agent) => {
        if (
          snapshot.activityId !== this.currentId ||
          snapshot.missionRevision !== this.state.missionRevision ||
          !this.canObserve()
        )
          return;
        this.state.agent = agent;
        const current = this.state.trail.at(-1);
        if (current?.id !== snapshot.activityId) return;
        current.classification = agent.classification;
        if (agent.classification === "on_track")
          this.state.recovery = recoveryFrom(this.state.trail);
        this.state.classifierStatus = agent.reason;
        this.evaluate();
        this.commit();
      },
      error: (message) => {
        this.resetAgent();
        this.state.classifierStatus = message;
        this.ports.publish();
      },
    });
  }
  private show(kind: Intervention["kind"], extra: Partial<Intervention> = {}) {
    const now = this.now();
    const latest = this.state.trail.at(-1);
    this.state.intervention = {
      ...decisionFor(this.state, this.state.agent, now),
      id: randomUUID(),
      kind,
      missionRevision: this.state.missionRevision,
      activityKey: latest ? activityKey(latest) : "",
      createdAt: now,
      expiresAt: now + 3 * 60000,
      url: latest?.url,
      ...extra,
    };
    this.state.lastInterrupt = now;
    this.state.stats.interrupts++;
    this.commit();
    this.ports.interrupt();
  }
  private evaluate() {
    if (
      this.state.intervention ||
      !this.state.settings.automaticNudges ||
      this.notifiedEpisode === this.currentId
    )
      return;
    if (
      shouldInterrupt(
        this.state,
        this.state.agent,
        this.state.lastInterrupt,
        this.now(),
      )
    ) {
      this.notifiedEpisode = this.currentId;
      this.show("drift");
    }
  }
  tick() {
    const now = this.now();
    if (this.state.pausedUntil && this.state.pausedUntil <= now) {
      this.state.pausedUntil = 0;
      this.invalidate();
      this.commit();
    }
    if (this.state.intervention && this.state.intervention.expiresAt <= now) {
      this.state.intervention = undefined;
      this.ports.dismiss();
      this.ports.publish();
    }
    if (
      !this.state.mission ||
      this.state.completedAt ||
      this.state.pausedUntil > now ||
      this.state.intervention
    )
      return;
    const due = upcomingCommitments(this.state, now).find(
      (c) =>
        c.leaveAt <= now + 5 * 60000 &&
        !this.state.remindedCommitments.includes(c.id),
    );
    if (due) {
      this.state.remindedCommitments.push(due.id);
      this.show("departure", {
        site: due.title,
        reason:
          due.leaveAt <= now
            ? "It is time to leave for " + due.title + "."
            : "Leave at " +
              new Date(due.leaveAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) +
              " for " +
              due.title +
              ".",
        minutesLeft: Math.max(0, Math.ceil((due.leaveAt - now) / 60000)),
        parkingCandidate: false,
      });
    }
  }
  preview() {
    this.show("preview", {
      site: "A side idea",
      reason: "This is a preview. Your real activity has not been classified.",
      parkingTitle: "An idea to revisit",
      parkingCandidate: true,
      url: undefined,
      activityKey: "",
    });
  }
  pin() {
    const latest = this.state.trail.at(-1);
    if (!latest || this.now() - latest.ts > 60000)
      throw new Error(
        "Open your work window, then return to Dave and pin it within a minute.",
      );
    latest.classification = "on_track";
    this.state.recovery = recoveryFrom(this.state.trail);
    this.commit();
  }
  async recover() {
    if (!this.state.recovery) throw new Error("Pin a work window first.");
    await this.ports.recover(structuredClone(this.state.recovery));
    this.state.stats.recoveries++;
    this.commit();
    this.ports.dismiss();
  }
  async choose(id: string, choice: Choice) {
    z.enum(["recover", "park", "correct", "snooze"]).parse(choice);
    if (this.applied.has(id)) return;
    if (this.actionRunning)
      throw new Error("Your previous action is still finishing.");
    const intervention = this.state.intervention;
    if (
      !intervention ||
      intervention.id !== id ||
      intervention.expiresAt <= this.now() ||
      intervention.missionRevision !== this.state.missionRevision
    )
      throw new Error("This nudge has expired.");
    this.actionRunning = true;
    try {
      if (choice === "recover") {
        if (!intervention.recovery.bundleId)
          throw new Error(
            "Pin a work window first. Your next action is shown here.",
          );
        await this.ports.recover(structuredClone(intervention.recovery));
        this.state.stats.recoveries++;
      } else if (choice === "park") {
        if (!intervention.parkingCandidate)
          throw new Error("There is no activity to save.");
        this.park({
          title: intervention.parkingTitle || intervention.site,
          url: intervention.url,
        });
      } else if (choice === "correct") {
        if (intervention.kind !== "drift")
          throw new Error("Corrections apply to classified activity.");
        this.state.corrections = [
          ...this.state.corrections.filter(
            (c) => c.activityKey !== intervention.activityKey,
          ),
          {
            domainOrApp: intervention.site,
            activityKey: intervention.activityKey,
            note: "Relevant to this mission",
          },
        ].slice(-500);
        this.state.agent = {
          classification: "on_track",
          confidence: 1,
          reason: "You marked this activity as relevant.",
        };
        this.scheduler.cancel();
      }
      // Snoozing never removes the mission. Cooldown applies across restarts.
      if (choice === "snooze" && intervention.kind === "drift")
        this.notifiedEpisode = undefined;
      this.state.lastInterrupt = this.now();
      this.applied.add(id);
      if (this.applied.size > 100)
        this.applied.delete(this.applied.values().next().value!);
      if (this.state.intervention?.id === id)
        this.state.intervention = undefined;
      this.commit();
      this.ports.dismiss();
    } finally {
      this.actionRunning = false;
    }
  }
  park(input: unknown) {
    if (this.state.parkedIdeas.length >= 1000)
      throw new Error("Remove an old saved idea before adding another.");
    const idea = ideaInput.parse(input);
    const tomorrow = new Date(this.now());
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    this.state.parkedIdeas.push({
      ...idea,
      id: randomUUID(),
      when: idea.when || tomorrow.toISOString(),
      synced: false,
    });
    this.state.stats.parked++;
    this.commit();
    return { synced: false };
  }
  updateIdea(input: unknown) {
    const value = z
      .object({
        id: z.string().uuid(),
        title: text,
        note: z.string().max(4000).optional(),
        when: date,
        completed: z.boolean(),
      })
      .parse(input);
    const idea = this.state.parkedIdeas.find((i) => i.id === value.id);
    if (!idea) throw new Error("This saved idea no longer exists.");
    Object.assign(idea, {
      title: value.title,
      note: value.note,
      when: value.when,
      completedAt: value.completed
        ? new Date(this.now()).toISOString()
        : undefined,
    });
    this.commit();
  }
  deleteIdea(id: string) {
    this.state.parkedIdeas = this.state.parkedIdeas.filter((i) => i.id !== id);
    this.commit();
  }
  async openIdea(id: string) {
    const url = this.state.parkedIdeas.find((i) => i.id === id)?.url;
    if (!url || !safeUrl(url)) throw new Error("This idea has no web link.");
    await this.ports.openUrl(url);
  }
  saveCommitment(input: unknown) {
    const value = commitmentInput.parse(input);
    if (this.state.commitments.length >= 100 && !value.id)
      throw new Error("Remove an old commitment first.");
    if (Date.parse(value.startsAt) <= this.now())
      throw new Error("Choose a future commitment.");
    const id = value.id || randomUUID();
    this.state.commitments = [
      ...this.state.commitments.filter((c) => c.id !== id),
      { ...value, id },
    ];
    this.state.remindedCommitments = this.state.remindedCommitments.filter(
      (entry) => entry !== id,
    );
    this.commit();
  }
  deleteCommitment(id: string) {
    this.state.commitments = this.state.commitments.filter((c) => c.id !== id);
    this.state.remindedCommitments = this.state.remindedCommitments.filter(
      (entry) => entry !== id,
    );
    this.commit();
  }
  clearHistory() {
    this.invalidate();
    this.state.trail = [];
    this.state.recovery = undefined;
    this.state.corrections = [];
    this.commit();
  }
}
