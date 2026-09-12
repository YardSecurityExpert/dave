const status = document.querySelector("#status");
let tab, preview;
const send = (message) =>
  chrome.runtime.sendMessage({ ...message, tabId: tab.id });
async function run(fn) {
  document.querySelectorAll("button").forEach((b) => (b.disabled = true));
  try {
    await fn();
  } catch (e) {
    status.textContent = e.message;
  } finally {
    document.querySelectorAll("button").forEach((b) => (b.disabled = false));
  }
}
void run(async () => {
  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.incognito || !tab.url?.startsWith("https://chatgpt.com/"))
    throw new Error("Open a ChatGPT conversation in a regular Chrome window.");
  const result = await send({ type: "status" });
  status.textContent = result.status || result.error;
});
document.querySelector("#preview").onclick = () =>
  run(async () => {
    if (!tab) throw new Error("Open ChatGPT first.");
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["extract.js", "content.js"],
    });
    const result = await chrome.tabs.sendMessage(tab.id, { type: "preview" });
    if (!result?.ok)
      throw new Error(result?.error || "This conversation is unavailable.");
    preview = result.data;
    document.querySelector("#title").textContent = preview.title;
    document.querySelector("#messages").textContent = preview.messages
      .map((m) => m.role + ": " + m.text)
      .join("\n\n");
    document.querySelector("#excerpt").hidden = false;
    status.textContent = "Review this excerpt, then connect.";
  });
document.querySelector("#connect").onclick = () =>
  run(async () => {
    const result = await send({ type: "connect", url: preview.url });
    if (!result.ok) throw new Error(result.error);
    status.textContent = result.status;
  });
document.querySelector("#disconnect").onclick = () =>
  run(async () => {
    await send({ type: "disconnect" });
    status.textContent = "Disconnected.";
    document.querySelector("#excerpt").hidden = true;
    preview = undefined;
  });
