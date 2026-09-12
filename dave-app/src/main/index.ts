import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  screen,
  ipcMain,
  shell,
  systemPreferences,
  powerMonitor,
} from "electron";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import type { Server } from "node:http";
import { config } from "dotenv";
import { z } from "zod";
import { loadState, saveState, settingsSchema } from "./storage/state";
import {
  loadKey,
  storeKey,
  loadAmbiguousKey,
  storeAmbiguousKey,
} from "./storage/credentials";
import { ChromeBridge } from "./services/chrome-bridge";
import { AmbiguousAdapter, ambiguousDraft } from "./adapters/ambiguous";
import { NativeAdapter } from "./adapters/native";
import { FocusService } from "./services/focus";
import { providerClassifier } from "./services/classifier";
import { excluded } from "./policy";

const here = dirname(fileURLToPath(import.meta.url));
const demoMode = process.env.DAVE_DEMO === "1";
// Keep the prototype's data path stable across product-name and packaging changes.
const dataDirectory = join(
  app.getPath("appData"),
  demoMode ? "dave-app-demo" : "dave-app",
);
mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
app.setPath("userData", dataDirectory);
app.setName("Dave");
process.env.DO_NOT_TRACK = "1";
config({ path: join(dataDirectory, ".env"), quiet: true } as any);
if (!app.isPackaged)
  config({ path: join(process.cwd(), ".env"), quiet: true } as any);
const state = loadState(dataDirectory, demoMode);
if (demoMode && !state.mission)
  Object.assign(state, {
    mission: "Finish the dashboard findings",
    currentPriority: "Help Caroline prepare for her customer call",
    currentStep: "Review the activation dashboard",
    nextAction: "Write the three findings",
  });
let win: BrowserWindow;
let tray: Tray;
let engine: FocusService;
let native: NativeAdapter;
let key: string | undefined;
let ambiguousKey: string | undefined;
let ambiguous: AmbiguousAdapter;
let chromeBridge: ChromeBridge | undefined;
const extensionDirectory = app.isPackaged
  ? join(process.resourcesPath, "chrome-extension")
  : join(here, "../../../dave-extension");
let runtime: Server | undefined;
let runtimeRevision = 0;
let runtimeQueue = Promise.resolve();
let locked = false;
let shuttingDown = false;
let polling = false;
let generation = 0;
let mode: "popover" | "interrupt" = "popover";
let wasPaused = state.pausedUntil > Date.now();
const imagePath = app.isPackaged
  ? join(process.resourcesPath, "dave.png")
  : join(here, "../../assets/dave.png");
function publish() {
  if (win && !win.isDestroyed()) win.webContents.send("dave:state", state);
  tray?.setToolTip(
    "Dave · " +
      (state.completedAt
        ? "Mission complete"
        : state.pausedUntil > Date.now()
          ? "Paused"
          : state.currentStep || "Choose your focus"),
  );
}
function dismiss() {
  if (mode === "interrupt") {
    mode = "popover";
    win?.hide();
  }
}
function show(next: "popover" | "interrupt") {
  mode = next;
  const area =
    next === "interrupt"
      ? screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea
      : screen.getDisplayMatching(tray.getBounds()).workArea;
  const width = Math.min(440, area.width),
    height = Math.min(760, area.height);
  const bounds = tray.getBounds();
  win.setBounds({
    width,
    height,
    x: Math.round(
      next === "interrupt"
        ? area.x + area.width - width - 16
        : Math.max(
            area.x,
            Math.min(
              bounds.x + bounds.width / 2 - width / 2,
              area.x + area.width - width,
            ),
          ),
    ),
    y: Math.round(
      area.y +
        (next === "interrupt" ? Math.max(0, area.height - height - 16) : 0),
    ),
  });
  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (next === "interrupt") win.showInactive();
  else {
    win.show();
    win.focus();
  }
}
function haltObservation() {
  generation++;
  native?.stop();
  engine?.invalidate();
  chromeBridge?.control(chromeAllowed(), true);
}
function chromeAllowed() {
  return (
    !locked &&
    !shuttingDown &&
    state.pausedUntil <= Date.now() &&
    powerMonitor.getSystemIdleTime() < 60 &&
    !excluded(
      {
        app: "Google Chrome",
        bundleId: "com.google.Chrome",
        url: "https://chatgpt.com/",
        title: "",
        ts: 0,
        dwellSec: 0,
      },
      state.settings,
    )
  );
}
function aiAllowed() {
  return (
    (demoMode || (state.settings.aiEnabled && !!key)) &&
    state.pausedUntil <= Date.now() &&
    !locked
  );
}
function refreshRuntime() {
  const revision = ++runtimeRevision;
  state.runtimeReady = false;
  state.runtimeUrl = undefined;
  state.runtimeToken = undefined;
  publish();
  runtime?.closeAllConnections();
  runtime?.close();
  runtime = undefined;
  runtimeQueue = runtimeQueue
    .catch(() => {})
    .then(async () => {
      if (revision !== runtimeRevision || !aiAllowed() || shuttingDown) return;
      try {
        const { startRuntime } = await import("./runtime");
        const token = randomBytes(32).toString("hex");
        const server = await startRuntime({
          demo: demoMode,
          token,
          allowed: aiAllowed,
          ai: { provider: state.settings.aiProvider, model: state.settings.aiModel, apiKey: key },
        });
        if (revision !== runtimeRevision || shuttingDown) {
          server.closeAllConnections();
          server.close();
          return;
        }
        runtime = server;
        const address = server.address();
        if (!address || typeof address === "string")
          throw new Error("No runtime address");
        state.runtimeReady = true;
        state.runtimeUrl =
          "http://127.0.0.1:" + address.port + "/api/copilotkit";
        state.runtimeToken = token;
        publish();
      } catch {
        state.classifierStatus =
          "Ask Dave could not start. Your local controls still work.";
        publish();
      }
    });
}
function trusted(event: Electron.IpcMainInvokeEvent | Electron.IpcMainEvent) {
  if (
    event.sender !== win.webContents ||
    event.senderFrame !== win.webContents.mainFrame ||
    event.senderFrame?.url !== win.webContents.getURL()
  )
    throw new Error("Untrusted IPC sender");
}
function wireIPC() {
  const handle = (name: string, action: (value: any) => unknown) =>
    ipcMain.handle("dave:" + name, (event, value) => {
      trusted(event);
      return action(value);
    });
  handle("getState", () => state);
  handle("installChrome", () => {
    if (demoMode || !chromeBridge)
      throw new Error("Use the normal Dave app to connect Chrome.");
    return chromeBridge.install();
  });
  handle("showExtension", () => {
    shell.showItemInFolder(join(extensionDirectory, "manifest.json"));
  });
  handle("chromeAction", async (p) => {
    const v = z
      .object({
        id: z.string().max(300),
        action: z.enum(["return", "pin", "park", "draft", "share", "unshare"]),
        text: z.string().trim().min(1).max(4000).optional(),
      })
      .parse(p);
    if (v.action === "unshare") {
      state.chromeAiChatId = undefined;
      refreshRuntime();
      return;
    }
    if (!chromeBridge) throw new Error("Chrome connection is unavailable.");
    const chat = chromeBridge.get(v.id);
    if (v.action === "return") return chromeBridge.request(v.id, "return");
    if (v.action === "draft") {
      if (!v.text) throw new Error("Enter a follow-up draft.");
      return chromeBridge.request(v.id, "draft", v.text);
    }
    if (v.action === "share") {
      state.chromeAiChatId = v.id;
      refreshRuntime();
      return;
    }
    if (v.action === "park") {
      engine.park({ title: chat.title, url: chat.url });
      return;
    }
    const next =
      chat.messages
        .filter((m) => m.role === "user")
        .at(-1)
        ?.text.slice(0, 1000) || chat.title;
    engine.setMission({
      mission: chat.title,
      currentPriority: chat.title,
      currentStep: next,
    });
    state.recovery = {
      app: "Google Chrome",
      bundleId: "com.google.Chrome",
      title: chat.title,
      urls: [chat.url],
      chromeChatId: v.id,
    };
    saveState(dataDirectory, state);
    publish();
  });
  handle("ambiguousKey", (p) => {
    const value = z.string().trim().max(512).parse(p);
    if (value && /\s/.test(value))
      throw new Error("The API key must not contain spaces.");
    ambiguous.cancel();
    storeAmbiguousKey(dataDirectory, value);
    ambiguousKey = value || undefined;
    state.ambiguousConfigured = !!ambiguousKey;
    publish();
  });
  handle("ambiguousList", () => ambiguous.list());
  handle("ambiguousCreate", (p) => ambiguous.create(ambiguousDraft.parse(p)));
  handle("ambiguousOpen", (p) =>
    shell.openExternal(
      "https://app.ambiguous.ai/tasks/" + z.string().uuid().parse(p),
    ),
  );
  handle("setMission", (p) => {
    haltObservation();
    return engine.setMission(p);
  });
  handle("pause", (p) => {
    engine.pause(p);
    haltObservation();
    refreshRuntime();
  });
  handle("resume", () => {
    engine.resume();
    chromeBridge?.control(!locked);
    refreshRuntime();
  });
  handle("complete", () => {
    engine.complete();
    haltObservation();
  });
  handle("pin", () => engine.pin());
  handle("recover", () => engine.recover());
  handle("choose", (p) => {
    const v = z
      .object({
        id: z.string().uuid(),
        choice: z.enum(["recover", "park", "correct", "snooze"]),
      })
      .parse(p);
    return engine.choose(v.id, v.choice);
  });
  handle("park", (p) => engine.park(p));
  handle("updateIdea", (p) => engine.updateIdea(p));
  handle("deleteIdea", (p) => engine.deleteIdea(z.string().uuid().parse(p)));
  handle("openIdea", (p) => engine.openIdea(z.string().uuid().parse(p)));
  handle("saveCommitment", (p) => engine.saveCommitment(p));
  handle("deleteCommitment", (p) =>
    engine.deleteCommitment(z.string().uuid().parse(p)),
  );
  handle("settings", (p) => {
    const settings = settingsSchema.parse(p);
    if (settings.startAtLogin !== state.settings.startAtLogin) {
      if (!app.isPackaged || demoMode)
        throw new Error("Start at login is available in the packaged app.");
      app.setLoginItemSettings({ openAtLogin: settings.startAtLogin });
    }
    const nextKey = loadKey(dataDirectory, settings.aiProvider);
    haltObservation();
    if (settings.aiProvider !== state.settings.aiProvider || settings.aiModel !== state.settings.aiModel)
      state.chromeAiChatId = undefined;
    key = nextKey;
    state.apiKeyConfigured = !!key;
    engine.saveSettings(settings);
    chromeBridge?.control(chromeAllowed(), true);
    refreshRuntime();
  });
  handle("key", (p) => {
    const { key: value, provider } = z.object({
      key: z.string().trim().max(512),
      provider: z.enum(["openai", "featherless"]),
    }).parse(p);
    if (provider !== state.settings.aiProvider)
      throw new Error("Save the provider settings before adding its key.");
    if (value && (/\s/.test(value) || value.length < 20 || (provider === "openai" && !value.startsWith("sk-"))))
      throw new Error("Enter a valid API key for the selected provider.");
    storeKey(dataDirectory, value, provider);
    key = value || undefined;
    state.apiKeyConfigured = !!key;
    engine.invalidate();
    refreshRuntime();
    publish();
  });
  handle("accessibility", () => {
    systemPreferences.isTrustedAccessibilityClient(true);
  });
  handle("clearHistory", () => {
    engine.clearHistory();
    state.chromeAiChatId = undefined;
    chromeBridge?.control(false, true);
    refreshRuntime();
  });
  ipcMain.on("dave:hide", (event) => {
    trusted(event);
    win.hide();
  });
  ipcMain.on("dave:simulate", (event) => {
    trusted(event);
    engine.preview();
  });
}
const statuses: Record<string, string> = {
  permission: "Allow Accessibility in Settings to read window titles",
  automation: "Allow browser Automation to read the active tab",
  excluded: "Excluded activity",
  self: "Your work is waiting",
  "browser-disabled": "Browser access is off or this browser is unsupported",
  "private-or-empty": "Private or empty browser window · no context retained",
};
async function poll() {
  if (shuttingDown || polling) return;
  polling = true;
  try {
    const active = !locked && powerMonitor.getSystemIdleTime() < 60;
    chromeBridge?.control(chromeAllowed());
    if (active) engine.tick();
    const paused = state.pausedUntil > Date.now();
    if (wasPaused !== paused) {
      wasPaused = paused;
      refreshRuntime();
    }
    if (!engine.canObserve() || !active) {
      if (native) native.stop();
      engine.unavailable(
        locked
          ? "Screen locked"
          : !active
            ? "Idle · observation paused"
            : state.completedAt
              ? "Mission complete"
              : paused
                ? "Paused"
                : state.demoMode
                  ? "Demo · no activity collected"
                  : !state.mission
                    ? "Choose a mission to begin"
                    : "Activity access is off",
        true,
      );
      return;
    }
    const started = generation;
    const result = await native.observe(state.settings);
    if (started !== generation || !engine.canObserve() || locked) return;
    if (result.event) engine.observe(result.event);
    else
      engine.unavailable(
        statuses[result.status] || "No activity context available",
        result.status === "self",
      );
  } catch {
    engine.unavailable("Activity helper unavailable · retrying");
  } finally {
    polling = false;
  }
}
if (!app.requestSingleInstanceLock()) app.quit();
else
  app
    .whenReady()
    .then(async () => {
      app.dock?.hide();
      try {
        key = loadKey(dataDirectory, state.settings.aiProvider);
      } catch {
        state.classifierStatus =
          "Saved credentials could not be opened. Add the key again in Settings.";
      }
      state.apiKeyConfigured = !!key;
      try {
        ambiguousKey = loadAmbiguousKey(dataDirectory);
      } catch {
        ambiguousKey = undefined;
      }
      state.ambiguousConfigured = !!ambiguousKey;
      ambiguous = new AmbiguousAdapter(() => ambiguousKey, dataDirectory);
      native = new NativeAdapter(
        app.isPackaged
          ? join(process.resourcesPath, "native/dave-helper")
          : join(here, "../native/dave-helper"),
      );
      win = new BrowserWindow({
        width: 440,
        height: 760,
        show: false,
        frame: false,
        transparent: true,
        resizable: false,
        title: "Dave",
        webPreferences: {
          preload: join(here, "../preload/index.cjs"),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });
      tray = new Tray(
        nativeImage.createFromPath(imagePath).resize({ width: 20, height: 20 }),
      );
      engine = new FocusService(state, {
        save: () => saveState(dataDirectory, state),
        publish,
        interrupt: () => show("interrupt"),
        dismiss,
        recover: async (target) => {
          // Invalidate pending observations before activating the saved destination.
          generation++;
          native.stop();
          if (target.chromeChatId && chromeBridge)
            await chromeBridge.request(target.chromeChatId, "return");
          else await native.recover(target);
        },
        openUrl: async (url) => {
          await shell.openExternal(url);
        },
        classify: providerClassifier(() => ({ provider: state.settings.aiProvider, model: state.settings.aiModel, apiKey: key })),
      });
      if (!demoMode) {
        chromeBridge = new ChromeBridge(
          dataDirectory,
          app.getPath("appData"),
          app.isPackaged
            ? join(process.resourcesPath, "native/dave-chrome-bridge")
            : join(here, "../native/dave-chrome-bridge"),
          join(extensionDirectory, "manifest.json"),
          () => {
            state.chrome = chromeBridge?.state();
            if (
              state.chromeAiChatId &&
              !state.chrome?.chats.some((c) => c.id === state.chromeAiChatId)
            ) {
              state.chromeAiChatId = undefined;
              refreshRuntime();
            }
            publish();
          },
        );
        try {
          await chromeBridge.start();
          chromeBridge.control(
            !locked && state.pausedUntil <= Date.now(),
            true,
          );
          state.chrome = chromeBridge.state();
        } catch {
          state.chrome = {
            enabled: false,
            registered: false,
            extensionId: chromeBridge.extensionId,
            chats: [],
            error: "Chrome connection could not start. Restart Dave.",
          };
        }
      }
      tray.on("click", () =>
        win.isVisible() && mode === "popover" ? win.hide() : show("popover"),
      );
      tray.on("right-click", () =>
        tray.popUpContextMenu(
          Menu.buildFromTemplate([
            { label: "Open Dave", click: () => show("popover") },
            {
              label:
                state.pausedUntil > Date.now()
                  ? "Resume"
                  : "Pause for 15 minutes",
              click: () => {
                state.pausedUntil > Date.now()
                  ? engine.resume()
                  : engine.pause("15m");
                haltObservation();
                refreshRuntime();
              },
            },
            { label: "Preview a nudge", click: () => engine.preview() },
            { type: "separator" },
            { label: "Quit Dave", click: () => app.quit() },
          ]),
        ),
      );
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: "Dave",
            submenu: [
              { label: "Open Dave", click: () => show("popover") },
              { role: "quit" },
            ],
          },
          { role: "editMenu" },
        ]),
      );
      win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      win.webContents.on("will-navigate", (event) => event.preventDefault());
      win.webContents.session.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      wireIPC();
      if (process.env.ELECTRON_RENDERER_URL)
        await win.loadURL(process.env.ELECTRON_RENDERER_URL);
      else await win.loadFile(join(here, "../renderer/index.html"));
      refreshRuntime();
      if (!process.argv.includes("--hidden")) show("popover");
      powerMonitor.on("lock-screen", () => {
        locked = true;
        haltObservation();
        refreshRuntime();
      });
      powerMonitor.on("suspend", () => {
        locked = true;
        haltObservation();
        refreshRuntime();
      });
      powerMonitor.on("unlock-screen", () => {
        locked = false;
        refreshRuntime();
      });
      powerMonitor.on("resume", () => {
        locked = false;
        refreshRuntime();
      });
      const timer = setInterval(() => void poll(), 2000);
      app.on("second-instance", () => show("popover"));
      app.on("activate", () => show("popover"));
      app.on("before-quit", () => {
        shuttingDown = true;
        runtimeRevision++;
        clearInterval(timer);
        engine.invalidate();
        native.stop();
        ambiguous.cancel();
        void chromeBridge?.close();
        runtime?.closeAllConnections();
        runtime?.close();
        saveState(dataDirectory, state);
      });
    })
    .catch((error) => {
      console.error(
        "Dave could not start:",
        error instanceof Error ? error.message : "Unknown error",
      );
      app.quit();
    });
app.on("window-all-closed", () => {});
