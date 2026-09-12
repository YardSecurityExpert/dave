let port,
  epoch,
  enabled = false,
  status =
    "Open Dave and install the Chrome connection in its Connections view.";
let connections = {};
const restored = chrome.storage.session.get("connections").then((v) => {
  connections = v.connections || {};
});
const persist = () => chrome.storage.session.set({ connections });
const local = chrome.storage.local.get("clientId").then(async (v) => {
  const clientId = v.clientId || crypto.randomUUID();
  await chrome.storage.local.set({ clientId });
  return clientId;
});
async function controls() {
  await restored;
  await Promise.all(
    Object.keys(connections).map(async (id) => {
      try {
        await chrome.tabs.sendMessage(Number(id), {
          type: "control",
          enabled,
          epoch,
        });
      } catch {
        delete connections[id];
      }
    }),
  );
  await persist();
}
function connectNative() {
  if (port) return;
  port = chrome.runtime.connectNative("app.thedave.chrome");
  port.onDisconnect.addListener(() => {
    status =
      chrome.runtime.lastError?.message ||
      "Dave disconnected. Open the app and reconnect.";
    port = undefined;
    enabled = false;
    void controls();
  });
  port.onMessage.addListener(async (message) => {
    if (message.type === "control") {
      epoch = message.epoch;
      enabled = message.enabled;
      status = enabled ? "Connected to Dave" : "Dave is paused";
      void controls();
      return;
    }
    if (message.type === "action") {
      try {
        await restored;
        const c = connections[message.tabId];
        if (
          !enabled ||
          message.epoch !== epoch ||
          !c ||
          c.url !== message.url ||
          Date.now() > message.expiresAt
        )
          throw new Error("This chat is disconnected or the request expired.");
        const tab = await chrome.tabs.get(message.tabId);
        if (tab.url?.replace(/\/$/, "") !== c.url)
          throw new Error("The tab now shows another conversation.");
        const opts = { documentId: c.documentId };
        const check = await chrome.tabs.sendMessage(
          tab.id,
          { type: "preview" },
          opts,
        );
        if (!check?.ok || check.data.url !== c.url)
          throw new Error("The conversation is unavailable.");
        await chrome.windows.update(tab.windowId, { focused: true });
        await chrome.tabs.update(tab.id, { active: true });
        if (message.operation === "draft") {
          const result = await chrome.tabs.sendMessage(
            tab.id,
            { ...message, type: "draft" },
            opts,
          );
          if (!result?.ok)
            throw new Error(result?.error || "Draft insertion failed.");
        } else if (message.operation !== "return")
          throw new Error("Unsupported action.");
        const resultTab = await chrome.tabs.get(tab.id);
        if (!resultTab.active || resultTab.url?.replace(/\/$/, "") !== c.url)
          throw new Error("Could not verify the target tab.");
        port?.postMessage({ type: "result", id: message.id, ok: true });
      } catch (error) {
        port?.postMessage({
          type: "result",
          id: message.id,
          ok: false,
          error: error.message,
        });
      }
    }
  });
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  (async () => {
    await restored;
    if (sender.id !== chrome.runtime.id) throw new Error("Unknown sender.");
    if (sender.tab) {
      const c = connections[sender.tab.id];
      if (
        !c ||
        sender.frameId !== 0 ||
        sender.documentId !== c.documentId ||
        sender.url?.replace(/\/$/, "") !== c.url
      )
        return { ok: false };
      if (message.type === "unavailable") {
        delete connections[sender.tab.id];
        await persist();
        port?.postMessage({ type: "remove", tabId: sender.tab.id });
        return { ok: true };
      }
      if (
        message.type === "snapshot" &&
        enabled &&
        message.epoch === epoch &&
        message.data?.url === c.url
      ) {
        port?.postMessage({
          type: "snapshot",
          epoch,
          clientId: await local,
          tabId: sender.tab.id,
          documentId: sender.documentId,
          revision: message.revision,
          data: message.data,
        });
      }
      return { ok: true };
    }
    if (sender.url !== chrome.runtime.getURL("popup.html"))
      throw new Error("Use the extension popup.");
    if (message.type === "status") {
      connectNative();
      return {
        ok: true,
        status,
        enabled,
        connected: !!connections[message.tabId],
      };
    }
    if (message.type === "connect") {
      connectNative();
      if (!enabled) throw new Error(status);
      const tab = await chrome.tabs.get(message.tabId);
      if (tab.incognito) throw new Error("Incognito is not supported.");
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["extract.js", "content.js"],
      });
      const documentId = result.find((r) => r.frameId === 0)?.documentId;
      const preview = await chrome.tabs.sendMessage(
        tab.id,
        { type: "preview" },
        { documentId },
      );
      if (!preview?.ok || preview.data.url !== message.url)
        throw new Error("The chat changed. Preview it again.");
      connections[tab.id] = { url: preview.data.url, documentId };
      await persist();
      await chrome.tabs.sendMessage(
        tab.id,
        { type: "connect", enabled, epoch },
        { documentId },
      );
      return {
        ok: true,
        status: "Connected. Find this chat in Dave → Connections.",
      };
    }
    if (message.type === "disconnect") {
      delete connections[message.tabId];
      await persist();
      port?.postMessage({ type: "remove", tabId: message.tabId });
      await chrome.tabs
        .sendMessage(message.tabId, { type: "disconnect" })
        .catch(() => {});
      return { ok: true };
    }
    throw new Error("Unsupported request.");
  })().then(respond, (error) => respond({ ok: false, error: error.message }));
  return true;
});
chrome.tabs.onRemoved.addListener(async (id) => {
  await restored;
  delete connections[id];
  await persist();
  port?.postMessage({ type: "remove", tabId: id });
});
