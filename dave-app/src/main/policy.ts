import type {
  AgentState,
  Decision,
  MissionState,
  TrailEvent,
  Settings,
} from "../shared/types";
export function safeUrl(value?: string): string | undefined {
  try {
    const url = new URL(value!);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return;
    return url.href;
  } catch {
    return;
  }
}
export function modelUrl(value?: string): string | undefined {
  const valid = safeUrl(value);
  if (!valid) return;
  const url = new URL(valid);
  url.search = "";
  url.hash = "";
  return url.href;
}
export function siteOf(event: TrailEvent): string {
  try {
    return new URL(event.url!).hostname.replace(/^www\./, "");
  } catch {
    return event.app;
  }
}
export function activityKey(event: TrailEvent): string {
  return JSON.stringify([
    event.bundleId || event.app,
    event.title,
    event.url || "",
  ]);
}
export function excluded(event: TrailEvent, settings: Settings): boolean {
  const names = [event.app.toLowerCase(), event.bundleId?.toLowerCase()];
  if (settings.excludedApps.some((app) => names.includes(app.toLowerCase())))
    return true;
  const host = event.url ? siteOf(event).toLowerCase() : "";
  return (
    !!host &&
    settings.excludedDomains.some(
      (domain) =>
        host === domain.toLowerCase() ||
        host.endsWith("." + domain.toLowerCase()),
    )
  );
}
export function recoveryFrom(trail: TrailEvent[]) {
  const work = [...trail]
    .reverse()
    .find((event) => event.classification === "on_track");
  return {
    app: work?.app,
    bundleId: work?.bundleId,
    title: work?.title,
    urls: work?.url ? [work.url] : [],
  };
}
export function decisionFor(
  s: MissionState,
  a: AgentState,
  now = Date.now(),
): Decision {
  const latest = s.trail.at(-1);
  return {
    site: latest ? siteOf(latest) : "Your activity",
    reason: a.reason,
    minutesLeft: s.deadline
      ? Math.max(0, Math.ceil((Date.parse(s.deadline) - now) / 60000))
      : null,
    unfinished: s.currentStep,
    attentionCostMin: Math.ceil((latest?.dwellSec || 0) / 60),
    recovery: s.recovery || recoveryFrom(s.trail),
    parkingCandidate: !!latest,
    parkingTitle: latest?.title || latest?.app,
  };
}
export function isCorrected(s: MissionState, event: TrailEvent) {
  return s.corrections.some(
    (correction) => correction.activityKey === activityKey(event),
  );
}
export function shouldInterrupt(
  s: MissionState,
  a: AgentState,
  lastInterrupt: number,
  now = Date.now(),
): boolean {
  const latest = s.trail.at(-1);
  return !!(
    s.mission &&
    !s.completedAt &&
    s.pausedUntil <= now &&
    latest &&
    a.classification === "distracted" &&
    a.confidence >= 0.7 &&
    now - lastInterrupt >= 600000 &&
    !isCorrected(s, latest) &&
    latest.dwellSec >= 90
  );
}
export function mergeTrail(
  trail: TrailEvent[],
  event: TrailEvent,
): TrailEvent[] {
  const prev = trail.at(-1);
  if (prev && activityKey(prev) === activityKey(event) && prev.id === event.id)
    return [
      ...trail.slice(0, -1),
      { ...event, dwellSec: prev.dwellSec + event.dwellSec },
    ];
  return [...trail, event].slice(-30);
}
export function upcomingCommitments(
  s: Pick<MissionState, "commitments">,
  now = Date.now(),
) {
  return s.commitments
    .map((c) => ({
      ...c,
      leaveAt: Date.parse(c.startsAt) - c.travelMinutes * 60000,
    }))
    .filter((c) => Date.parse(c.startsAt) > now)
    .sort((a, b) => a.leaveAt - b.leaveAt);
}
