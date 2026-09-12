(() => {
  function identity(href) {
    const url = new URL(href);
    if (url.origin !== "https://chatgpt.com" || url.search || url.hash)
      throw new Error("Open a saved ChatGPT conversation to connect.");
    if (!/^\/(?:g\/[^/]+\/)?c\/[a-zA-Z0-9-]{1,100}\/?$/.test(url.pathname))
      throw new Error(
        "Open a saved conversation. New and Temporary Chats are not supported.",
      );
    return url.origin + url.pathname.replace(/\/$/, "");
  }
  function extract(doc, href) {
    const url = identity(href);
    const main = doc.querySelector("main");
    if (!main) throw new Error("This ChatGPT layout is not supported.");
    const nodes = [...main.querySelectorAll("[data-message-author-role]")]
      .filter((n) =>
        ["user", "assistant"].includes(
          n.getAttribute("data-message-author-role"),
        ),
      )
      .filter((n) => !n.parentElement?.closest("[data-message-author-role]"));
    if (!nodes.length)
      throw new Error(
        "No loaded messages found. Open an ordinary text conversation.",
      );
    let remaining = 12000;
    const messages = nodes
      .slice(-6)
      .reverse()
      .map((node) => {
        const copy = (node.querySelector(".markdown") || node).cloneNode(true);
        copy
          .querySelectorAll(
            'button,textarea,input,script,style,svg,nav,[hidden],[aria-hidden="true"]',
          )
          .forEach((n) => n.remove());
        const original = (copy.textContent || "").trim();
        const text = original.slice(0, remaining);
        remaining -= text.length;
        return { role: node.getAttribute("data-message-author-role"), text };
      })
      .reverse()
      .filter((m) => m.text);
    if (!messages.length) throw new Error("No readable message text found.");
    return {
      url,
      title: (
        doc.title.replace(/\s*[-–|]\s*ChatGPT\s*$/, "") ||
        "ChatGPT conversation"
      ).slice(0, 500),
      messages,
      coverage: "Latest loaded messages only",
      responseState: main.querySelector('button[data-testid="stop-button"]')
        ? "responding"
        : "unknown",
      canDraft: !!main.querySelector(
        '#prompt-textarea[contenteditable="true"],textarea#prompt-textarea',
      ),
    };
  }
  globalThis.DaveChatGPT = { identity, extract };
})();
