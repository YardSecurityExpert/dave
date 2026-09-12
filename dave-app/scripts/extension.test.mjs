import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
const extension = new URL("../../dave-extension/", import.meta.url);
const source = (name) => readFileSync(new URL(name, extension), "utf8");
const url = "https://chatgpt.com/c/abc-123";
function page(html) {
  const dom = new JSDOM(html, { url, runScripts: "outside-only" });
  dom.window.eval(source("extract.js"));
  return dom;
}
test("extracts a bounded conversation without sidebar history, drafts, or button text", () => {
  const dom = page(
    '<title>Dashboard - ChatGPT</title><aside>Private other chat</aside><main><textarea id="prompt-textarea">Unsent secret</textarea>' +
      Array.from(
        { length: 9 },
        (_, i) =>
          `<article data-message-author-role="${i % 2 ? "assistant" : "user"}"><div class="markdown">${i} ${"x".repeat(3000)}<button>Copy SECRET</button></div></article>`,
      ).join("") +
      "</main>",
  );
  const result = dom.window.DaveChatGPT.extract(dom.window.document, url);
  const joined = result.messages.map((x) => x.text).join("");
  assert.equal(result.title, "Dashboard");
  assert.ok(joined.length <= 12000);
  assert.ok(result.messages.length <= 6);
  assert.ok(!joined.includes("SECRET"));
  assert.ok(!joined.includes("Unsent"));
  assert.ok(!joined.includes("Private"));
  assert.ok(!joined.startsWith("0 "));
  assert.equal(result.responseState, "unknown");
  dom.window.close();
});
test("rejects new, temporary, foreign, and unknown layouts without guessing", () => {
  const dom = page("<main>Missing messages</main>");
  for (const bad of [
    "https://chatgpt.com/",
    "https://chatgpt.com/?temporary-chat=true",
    "https://evil.example/c/abc",
    "https://chatgpt.com/c/abc?token=secret",
  ])
    assert.throws(() => dom.window.DaveChatGPT.identity(bad));
  assert.throws(() => dom.window.DaveChatGPT.extract(dom.window.document, url));
  dom.window.close();
});
test("content collection stops on pause and invalidates a changed conversation", async () => {
  const dom = page(
    '<main><article data-message-author-role="user">Build dashboard</article><textarea id="prompt-textarea"></textarea></main>',
  );
  const sent = [];
  let listener;
  dom.window.chrome = {
    runtime: {
      sendMessage: async (m) => sent.push(m),
      onMessage: { addListener: (fn) => (listener = fn) },
    },
  };
  dom.window.eval(source("content.js"));
  const call = (m) => new Promise((resolve) => listener(m, {}, resolve));
  await call({ type: "connect", enabled: true, epoch: "one" });
  await new Promise((r) => setImmediate(r));
  assert.equal(sent.at(-1).type, "snapshot");
  await call({ type: "control", enabled: false, epoch: "two" });
  assert.equal(
    (
      await call({
        type: "draft",
        epoch: "one",
        url,
        revision: 1,
        text: "Do it",
      })
    ).ok,
    false,
  );
  dom.window.history.replaceState({}, "", "/c/other");
  await call({ type: "control", enabled: true, epoch: "three" });
  assert.equal(sent.at(-1).type, "unavailable");
  dom.window.close();
});
test("draft insertion preserves existing text and never submits a message", async () => {
  const dom = page(
    '<main><article data-message-author-role="user">Dashboard</article><form><textarea id="prompt-textarea">Existing draft</textarea><button type="submit">Send</button></form></main>',
  );
  let listener,
    submits = 0;
  dom.window.document
    .querySelector("form")
    .addEventListener("submit", () => submits++);
  dom.window.chrome = {
    runtime: {
      sendMessage: async () => {},
      onMessage: { addListener: (fn) => (listener = fn) },
    },
  };
  dom.window.eval(source("content.js"));
  const call = (m) => new Promise((resolve) => listener(m, {}, resolve));
  await call({ type: "connect", enabled: true, epoch: "one" });
  const action = {
    type: "draft",
    epoch: "one",
    url,
    revision: 1,
    text: "Next step",
  };
  assert.equal((await call(action)).ok, false);
  const input = dom.window.document.querySelector("textarea");
  assert.equal(input.value, "Existing draft");
  input.value = "";
  assert.equal((await call(action)).ok, true);
  assert.equal(input.value, "Next step");
  assert.equal(submits, 0);
  dom.window.close();
});
test("worker accepts only the connected top-level document and rejects moved targets", async () => {
  let listener,
    nativeListener,
    tabUrl = url;
  const posted = [];
  const id = "abcdefghijklmnopabcdefghijklmnop",
    documentId = "document-1";
  const chrome = {
    runtime: {
      id,
      getURL: (p) => "chrome-extension://" + id + "/" + p,
      onMessage: { addListener: (fn) => (listener = fn) },
      connectNative: () => ({
        postMessage: (m) => posted.push(m),
        onDisconnect: { addListener: () => {} },
        onMessage: {
          addListener: (fn) => {
            nativeListener = fn;
            queueMicrotask(() =>
              fn({ type: "control", enabled: true, epoch: "epoch" }),
            );
          },
        },
      }),
    },
    storage: {
      session: { get: async () => ({}), set: async () => {} },
      local: { get: async () => ({}), set: async () => {} },
    },
    tabs: {
      get: async () => ({ id: 1, windowId: 1, url: tabUrl, active: true }),
      sendMessage: async () => ({ ok: true, data: { url } }),
      update: async () => {},
      onRemoved: { addListener: () => {} },
    },
    windows: { update: async () => {} },
    scripting: { executeScript: async () => [{ frameId: 0, documentId }] },
  };
  vm.runInNewContext(source("worker.js"), {
    chrome,
    crypto: webcrypto,
    queueMicrotask,
    console,
    setTimeout,
    clearTimeout,
  });
  const popup = { id, url: chrome.runtime.getURL("popup.html") };
  const call = (message, sender = popup) =>
    new Promise((resolve) => listener(message, sender, resolve));
  await call({ type: "status", tabId: 1 });
  await new Promise((r) => setImmediate(r));
  assert.equal((await call({ type: "connect", tabId: 1, url })).ok, true);
  const snap = { type: "snapshot", epoch: "epoch", revision: 1, data: { url } };
  await call(snap, {
    id,
    tab: { id: 1 },
    frameId: 0,
    documentId: "wrong",
    url,
  });
  assert.equal(posted.length, 0);
  await call(snap, { id, tab: { id: 1 }, frameId: 0, documentId, url });
  assert.equal(posted.length, 1);
  tabUrl = "https://chatgpt.com/c/other";
  await nativeListener({
    type: "action",
    id: "action-1",
    tabId: 1,
    url,
    epoch: "epoch",
    operation: "draft",
    expiresAt: Date.now() + 1000,
  });
  assert.equal(posted.at(-1).ok, false);
});
