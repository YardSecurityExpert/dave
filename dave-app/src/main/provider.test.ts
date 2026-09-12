import { test } from "node:test";
import assert from "node:assert/strict";
import { providerClassifier, type Snapshot } from "./services/classifier";
import { settingsSchema, defaultSettings } from "./storage/state";
import { defaultModels } from "../shared/ai";
import { aiErrorMessage } from "../shared/ai-errors";
const snapshot: Snapshot = { id: "test", missionRevision: 1, activityId: "test", mission: { mission: "Ship Dave", currentPriority: "Demo", currentStep: "Record" }, activity: { app: "Chrome", title: "Docs" } };
test("existing settings migrate to OpenAI while preserving user choices", () => {
  const { aiProvider, aiModel, ...old } = { ...defaultSettings, aiEnabled: true, dailyRequestLimit: 27 };
  assert.deepEqual(settingsSchema.parse(old), { ...old, aiProvider: "openai", aiModel: defaultModels.openai });
});
test("Featherless classifier uses only its selected key and validates complete output", async () => {
  let body: any;
  let finish = "stop";
  let content = JSON.stringify({ classification: "uncertain", confidence: 0.4, reason: "Could be research" });
  const classifier = providerClassifier(() => ({ provider: "featherless", model: defaultModels.featherless, apiKey: "featherless-test" }), (async (url, init) => {
    assert.equal(url, "https://api.featherless.ai/v1/chat/completions");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer featherless-test");
    assert.equal(init?.redirect, "error");
    body = JSON.parse(String(init?.body));
    return Response.json({ choices: [{ finish_reason: finish, message: { content } }], usage: { total_tokens: 12 } });
  }) as typeof fetch);
  assert.equal((await classifier(snapshot, new AbortController().signal)).tokens, 12);
  assert.equal(body.model, defaultModels.featherless);
  assert.equal(body.max_tokens, 800);
  assert.equal(body.tools, undefined);
  assert.equal(body.response_format.type, "json_object");
  assert.deepEqual(body.chat_template_kwargs, { enable_thinking: false });
  assert.deepEqual(JSON.parse(body.messages[1].content), snapshot);
  finish = "length";
  await assert.rejects(() => classifier(snapshot, new AbortController().signal), /complete classification/);
  finish = "stop";
  content = '{"classification":"distracted","confidence":99,"reason":"bad"}';
  await assert.rejects(() => classifier(snapshot, new AbortController().signal));
});
test("a missing Featherless key never makes an API request", async () => {
  const classifier = providerClassifier(() => ({ provider: "featherless", model: defaultModels.featherless }), (async () => { assert.fail("No request allowed"); }) as typeof fetch);
  await assert.rejects(() => classifier(snapshot, new AbortController().signal), /Featherless API key/);
});
test("provider error messages never expose keys or request data", () => {
  assert.match(aiErrorMessage("429 insufficient_quota secret-and-private-data"), /credits/);
  const rejected = aiErrorMessage("401 secret-and-private-data");
  assert.match(rejected, /rejected/);
  assert.equal(aiErrorMessage(rejected), rejected);
  const forbidden = aiErrorMessage("403 private-request");
  assert.equal(aiErrorMessage(forbidden), forbidden);
  assert.match(aiErrorMessage("429 concurrency secret-and-private-data"), /busy/);
  assert.ok(!aiErrorMessage("private-data sk-secret").includes("private-data"));
});
