import type {
  ChromeState,
  AmbiguousDraft,
  AmbiguousTask,
} from "./integrations";
export type Classification = "on_track" | "uncertain" | "distracted";
export type AgentState = {
  classification: Classification;
  confidence: number;
  reason: string;
};
export type TrailEvent = {
  id?: string;
  ts: number;
  app: string;
  bundleId?: string;
  title: string;
  url?: string;
  dwellSec: number;
  classification?: Classification;
};
export type Correction = {
  domainOrApp: string;
  note: string;
  activityKey?: string;
};
export type ParkedIdea = {
  id: string;
  title: string;
  url?: string;
  note?: string;
  when: string;
  completedAt?: string;
  synced: boolean;
  taskId?: string;
  eventId?: string;
};
export type Mission = {
  mission: string;
  currentPriority: string;
  currentStep: string;
  nextAction?: string;
  deadline?: string;
  deadlineSource?: "user" | "ambiguous";
  corrections: Correction[];
  parkedIdeas: ParkedIdea[];
  stats: { interrupts: number; recoveries: number; parked: number };
};
export type Commitment = {
  id: string;
  title: string;
  startsAt: string;
  travelMinutes: number;
};
export type Recovery = {
  chromeChatId?: string;
  app?: string;
  bundleId?: string;
  title?: string;
  urls: string[];
};
export type Settings = {
  aiProvider: import("./ai").AIProvider;
  aiModel: string;
  trackingEnabled: boolean;
  aiEnabled: boolean;
  automaticNudges: boolean;
  chromeEnabled: boolean;
  safariEnabled: boolean;
  excludedApps: string[];
  excludedDomains: string[];
  dailyRequestLimit: number;
  startAtLogin: boolean;
};
export type Decision = {
  site: string;
  reason: string;
  minutesLeft: number | null;
  unfinished: string;
  attentionCostMin: number;
  recovery: Recovery;
  parkingCandidate: boolean;
  parkingTitle?: string;
};
export type Intervention = Decision & {
  id: string;
  missionRevision: number;
  activityKey: string;
  createdAt: number;
  expiresAt: number;
  url?: string;
  kind: "drift" | "departure" | "preview";
};
export type MissionState = Mission & {
  chrome?: ChromeState;
  chromeAiChatId?: string;
  ambiguousConfigured?: boolean;
  version: 2;
  missionRevision: number;
  completedAt?: string;
  pausedUntil: number;
  lastInterrupt: number;
  trail: TrailEvent[];
  recovery?: Recovery;
  commitments: Commitment[];
  remindedCommitments: string[];
  settings: Settings;
  usage: { day: string; requests: number; tokens: number };
  agent: AgentState;
  intervention?: Intervention;
  calendarEvents: unknown[];
  watcherStatus: string;
  classifierStatus: string;
  storageWarning?: string;
  runtimeReady: boolean;
  runtimeUrl?: string;
  runtimeToken?: string;
  apiKeyConfigured: boolean;
  demoMode: boolean;
};
export type MissionInput = Pick<
  Mission,
  "mission" | "currentPriority" | "currentStep" | "nextAction" | "deadline"
>;
export type Choice = "recover" | "park" | "correct" | "snooze";
export type DaveAPI = {
  installChrome(): Promise<string>;
  showExtension(): Promise<void>;
  chromeAction(p: {
    id: string;
    action: "return" | "pin" | "park" | "draft" | "share" | "unshare";
    text?: string;
  }): Promise<void>;
  saveAmbiguousKey(key: string): Promise<void>;
  listAmbiguousTasks(): Promise<AmbiguousTask[]>;
  createAmbiguousTask(draft: AmbiguousDraft): Promise<AmbiguousTask>;
  openAmbiguousTask(id: string): Promise<void>;
  setMission(p: MissionInput): Promise<Mission>;
  pause(until: "15m" | "today"): Promise<void>;
  resume(): Promise<void>;
  completeMission(): Promise<void>;
  pinRecovery(): Promise<void>;
  recover(): Promise<void>;
  choose(p: { id: string; choice: Choice }): Promise<void>;
  park(p: {
    title: string;
    url?: string;
    when?: string;
    note?: string;
  }): Promise<{ synced: boolean }>;
  updateIdea(p: {
    id: string;
    title: string;
    note?: string;
    when: string;
    completed: boolean;
  }): Promise<void>;
  deleteIdea(id: string): Promise<void>;
  openIdea(id: string): Promise<void>;
  saveCommitment(p: {
    id?: string;
    title: string;
    startsAt: string;
    travelMinutes: number;
  }): Promise<void>;
  deleteCommitment(id: string): Promise<void>;
  saveSettings(p: Settings): Promise<void>;
  saveApiKey(key: string, provider: import("./ai").AIProvider): Promise<void>;
  requestAccessibility(): Promise<void>;
  clearHistory(): Promise<void>;
  hide(): void;
  getState(): Promise<MissionState>;
  onState(cb: (s: MissionState) => void): () => void;
  simulateDrift(): void;
};
declare global {
  interface Window {
    dave: DaveAPI;
  }
}
