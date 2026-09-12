(() => {
  if (globalThis.__daveContent) return;
  globalThis.__daveContent = true;
  let connectedUrl,
    enabled = false,
    revision = 0,
    last = "",
    epoch;
  let observer, interval, timer;
  function clear() {
    enabled = false;
    observer?.disconnect();
    clearInterval(interval);
    clearTimeout(timer);
    last = "";
  }
  async function snapshot() {
    if (!enabled) return;
    try {
      if (DaveChatGPT.identity(location.href) !== connectedUrl)
        throw new Error(
          "The conversation changed. Reconnect using the Dave toolbar button.",
        );
      const data = DaveChatGPT.extract(document, location.href);
      const signature = JSON.stringify(data);
      if (signature !== last) {
        revision++;
        last = signature;
      }
      await chrome.runtime.sendMessage({
        type: "snapshot",
        epoch,
        revision,
        data,
      });
    } catch (error) {
      clear();
      void chrome.runtime
        .sendMessage({ type: "unavailable", error: error.message })
        .catch(() => {});
    }
  }
  function start() {
    clear();
    enabled = true;
    observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(snapshot, 500);
    });
    observer.observe(document.querySelector("main"), {
      subtree: true,
      childList: true,
      characterData: true,
    });
    interval = setInterval(snapshot, 5000);
    void snapshot();
  }
  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    try {
      if (message.type === "preview") {
        respond({
          ok: true,
          data: DaveChatGPT.extract(document, location.href),
        });
        return;
      }
      if (message.type === "connect") {
        connectedUrl = DaveChatGPT.identity(location.href);
        epoch = message.epoch;
        revision = 0;
        if (message.enabled) start();
        respond({ ok: true });
        return;
      }
      if (message.type === "control") {
        epoch = message.epoch;
        if (connectedUrl && message.enabled) start();
        else clear();
        respond({ ok: true });
        return;
      }
      if (message.type === "disconnect") {
        clear();
        connectedUrl = undefined;
        respond({ ok: true });
        return;
      }
      if (message.type === "draft") {
        if (
          !enabled ||
          message.epoch !== epoch ||
          message.url !== connectedUrl ||
          DaveChatGPT.identity(location.href) !== connectedUrl ||
          message.revision !== revision
        )
          throw new Error(
            "The conversation changed. Review the latest chat before inserting a draft.",
          );
        if (
          typeof message.text !== "string" ||
          !message.text.trim() ||
          message.text.length > 4000
        )
          throw new Error("Enter a draft of 1–4,000 characters.");
        const input = document.querySelector("main #prompt-textarea");
        if (!input) throw new Error("The ChatGPT composer is unavailable.");
        const composerValue = () =>
          input.tagName === "TEXTAREA" ? input.value : input.textContent || "";
        if (composerValue().trim())
          throw new Error(
            "ChatGPT already has a draft. Keep or clear it there first.",
          );
        input.focus();
        if (input.tagName === "TEXTAREA") {
          Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value",
          ).set.call(input, message.text);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (input.isContentEditable) {
          if (!document.execCommand("insertText", false, message.text))
            throw new Error("Could not insert the draft.");
        } else throw new Error("This composer is unsupported.");
        if (composerValue().trim() !== message.text.trim())
          throw new Error(
            "Draft insertion could not be verified. Check ChatGPT before retrying.",
          );
        respond({ ok: true });
        return;
      }
    } catch (error) {
      respond({ ok: false, error: error.message });
    }
  });
  window.addEventListener("pagehide", () => {
    clear();
    void chrome.runtime
      .sendMessage({
        type: "unavailable",
        error: "The page was closed or reloaded. Reconnect this chat.",
      })
      .catch(() => {});
  });
})();
