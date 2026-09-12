import { contextBridge, ipcRenderer } from "electron";
import type { DaveAPI, MissionState } from "../shared/types";
const api: DaveAPI = {
  installChrome: () => ipcRenderer.invoke("dave:installChrome"),
  showExtension: () => ipcRenderer.invoke("dave:showExtension"),
  chromeAction: (p) => ipcRenderer.invoke("dave:chromeAction", p),
  saveAmbiguousKey: (key) => ipcRenderer.invoke("dave:ambiguousKey", key),
  listAmbiguousTasks: () => ipcRenderer.invoke("dave:ambiguousList"),
  createAmbiguousTask: (draft) =>
    ipcRenderer.invoke("dave:ambiguousCreate", draft),
  openAmbiguousTask: (id) => ipcRenderer.invoke("dave:ambiguousOpen", id),
  setMission: (p) => ipcRenderer.invoke("dave:setMission", p),
  pause: (p) => ipcRenderer.invoke("dave:pause", p),
  resume: () => ipcRenderer.invoke("dave:resume"),
  completeMission: () => ipcRenderer.invoke("dave:complete"),
  pinRecovery: () => ipcRenderer.invoke("dave:pin"),
  recover: () => ipcRenderer.invoke("dave:recover"),
  choose: (p) => ipcRenderer.invoke("dave:choose", p),
  park: (p) => ipcRenderer.invoke("dave:park", p),
  updateIdea: (p) => ipcRenderer.invoke("dave:updateIdea", p),
  deleteIdea: (p) => ipcRenderer.invoke("dave:deleteIdea", p),
  openIdea: (p) => ipcRenderer.invoke("dave:openIdea", p),
  saveCommitment: (p) => ipcRenderer.invoke("dave:saveCommitment", p),
  deleteCommitment: (p) => ipcRenderer.invoke("dave:deleteCommitment", p),
  saveSettings: (p) => ipcRenderer.invoke("dave:settings", p),
  saveApiKey: (key, provider) => ipcRenderer.invoke("dave:key", { key, provider }),
  requestAccessibility: () => ipcRenderer.invoke("dave:accessibility"),
  clearHistory: () => ipcRenderer.invoke("dave:clearHistory"),
  hide: () => ipcRenderer.send("dave:hide"),
  getState: () => ipcRenderer.invoke("dave:getState"),
  onState: (cb) => {
    const listener = (_event: Electron.IpcRendererEvent, value: MissionState) =>
      cb(value);
    ipcRenderer.on("dave:state", listener);
    return () => ipcRenderer.removeListener("dave:state", listener);
  },
  simulateDrift: () => ipcRenderer.send("dave:simulate"),
};
contextBridge.exposeInMainWorld("dave", api);
