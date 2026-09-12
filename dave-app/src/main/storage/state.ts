import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  copyFileSync,
} from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { MissionState, Settings } from "../../shared/types";
import { defaultModels } from "../../shared/ai";
export const text = z.string().trim().min(1).max(4000);
export const httpUrl = z
  .string()
  .max(8192)
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  }, "Use a web URL without embedded credentials");
export const date = z.string().datetime({ offset: true });
export const missionInput = z.object({
  mission: text,
  currentPriority: text,
  currentStep: text,
  nextAction: text.optional(),
  deadline: date.optional(),
});
export const settingsSchema = z.object({
  trackingEnabled: z.boolean(),
  aiEnabled: z.boolean(),
  aiProvider: z.enum(["openai", "featherless"]).default("openai"),
  aiModel: z.string().trim().min(1).max(200).regex(/^[a-zA-Z0-9_./:-]+$/).default(defaultModels.openai),
  automaticNudges: z.boolean(),
  chromeEnabled: z.boolean(),
  safariEnabled: z.boolean(),
  excludedApps: z.array(text).max(100),
  excludedDomains: z.array(text).max(100),
  dailyRequestLimit: z.number().int().min(1).max(1000),
  startAtLogin: z.boolean(),
});
export const defaultSettings: Settings = {
  trackingEnabled: false,
  aiEnabled: false,
  aiProvider: "openai",
  aiModel: defaultModels.openai,
  automaticNudges: false,
  chromeEnabled: false,
  safariEnabled: false,
  excludedApps: [],
  excludedDomains: [],
  dailyRequestLimit: 100,
  startAtLogin: false,
};
export const ideaInput = z.object({
  title: text,
  url: httpUrl.optional(),
  when: date.optional(),
  note: z.string().max(4000).optional(),
});
export const commitmentInput = z.object({
  id: z.string().uuid().optional(),
  title: text,
  startsAt: date,
  travelMinutes: z.number().int().min(0).max(1440),
});
const persisted = z.object({
  version: z.literal(2),
  mission: z.string().max(4000),
  currentPriority: z.string().max(4000),
  currentStep: z.string().max(4000),
  nextAction: text.optional(),
  deadline: date.optional(),
  deadlineSource: z.enum(["user", "ambiguous"]).optional(),
  missionRevision: z.number().int().nonnegative(),
  completedAt: date.optional(),
  pausedUntil: z.number().nonnegative(),
  lastInterrupt: z.number().nonnegative(),
  corrections: z
    .array(
      z.object({
        domainOrApp: text,
        note: text,
        activityKey: z.string().max(20000).optional(),
      }),
    )
    .max(500),
  parkedIdeas: z
    .array(
      ideaInput.extend({
        id: z.string().uuid(),
        when: date,
        synced: z.boolean(),
        completedAt: date.optional(),
      }),
    )
    .max(1000),
  stats: z.object({
    interrupts: z.number().nonnegative(),
    recoveries: z.number().nonnegative(),
    parked: z.number().nonnegative(),
  }),
  recovery: z
    .object({
      chromeChatId: z.string().max(300).optional(),
      app: text.optional(),
      bundleId: text.optional(),
      title: z.string().max(4000).optional(),
      urls: z.array(httpUrl).max(1),
    })
    .optional(),
  commitments: z
    .array(commitmentInput.extend({ id: z.string().uuid() }))
    .max(100),
  remindedCommitments: z.array(z.string()).max(100),
  settings: settingsSchema,
  usage: z.object({
    day: z.string(),
    requests: z.number().int().nonnegative(),
    tokens: z.number().int().nonnegative(),
  }),
});
export function localDay(now = Date.now()) {
  return new Date(now).toLocaleDateString("en-CA");
}
export function emptyState(demoMode = false): MissionState {
  return {
    version: 2,
    mission: "",
    currentPriority: "",
    currentStep: "",
    missionRevision: 0,
    corrections: [],
    parkedIdeas: [],
    stats: { interrupts: 0, recoveries: 0, parked: 0 },
    pausedUntil: 0,
    lastInterrupt: 0,
    trail: [],
    commitments: [],
    remindedCommitments: [],
    settings: structuredClone(defaultSettings),
    usage: { day: localDay(), requests: 0, tokens: 0 },
    agent: {
      classification: "uncertain",
      confidence: 0,
      reason: "Choose your next small step.",
    },
    calendarEvents: [],
    watcherStatus: demoMode
      ? "Demo · no activity collected"
      : "Activity access is off",
    classifierStatus: "AI classification is off",
    runtimeReady: false,
    apiKeyConfigured: false,
    demoMode,
  };
}
export function migrateState(raw: unknown) {
  const legacy = z.record(z.unknown()).parse(raw);
  if (legacy.version !== undefined && legacy.version !== 2)
    throw new Error("Unknown data version");
  if (legacy.version === 2) return persisted.parse(legacy);
  const ideas = z
    .array(ideaInput.extend({ when: date }))
    .parse(legacy.parkedIdeas ?? []);
  return persisted.parse({
    ...emptyState(),
    ...legacy,
    version: 2,
    missionRevision: 1,
    corrections: [],
    parkedIdeas: ideas.map((idea) => ({
      ...idea,
      id: randomUUID(),
      synced: false,
    })),
    settings: defaultSettings,
  });
}
export function loadState(directory: string, demoMode = false): MissionState {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, "state.json");
  const state = emptyState(demoMode);
  if (!existsSync(path)) return state;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    const migrated = migrateState(raw);
    if (
      raw.version !== 2 &&
      !existsSync(join(directory, "state-v1.backup.json"))
    )
      copyFileSync(path, join(directory, "state-v1.backup.json"));
    return { ...state, ...migrated };
  } catch {
    const backup = join(directory, "state-unreadable-" + Date.now() + ".json");
    copyFileSync(path, backup);
    state.storageWarning =
      "Dave could not read its saved data. A backup was kept at " +
      backup +
      ".";
    return state;
  }
}
export function saveState(directory: string, state: MissionState) {
  const data = persisted.parse(state);
  const path = join(directory, "state.json");
  writeFileSync(path + ".tmp", JSON.stringify(data, null, 2), { mode: 0o600 });
  renameSync(path + ".tmp", path);
}
