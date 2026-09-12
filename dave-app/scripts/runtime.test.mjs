import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
process.env.DO_NOT_TRACK = "1";
const buildDirectory = new URL("../out/main/", import.meta.url);
const runtimeFile = (await readdir(buildDirectory)).find((name) =>
  /^runtime-.*\.js$/.test(name),
);
assert.ok(runtimeFile, "Run npm run build before testing the runtime.");
const { startRuntime } = await import(
  new URL(runtimeFile, buildDirectory).href
);

test(
  "CopilotKit HTTP runtime waits for a choice and streams each continuation",
  { timeout: 15000 },
  async (t) => {
    const token = randomUUID();
    let allowed = true;
    const server = await startRuntime({
      demo: true,
      port: 0,
      token,
      allowed: () => allowed,
    });
    t.after(
      () =>
        new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          server.closeAllConnections();
        }),
    );
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}/api/copilotkit`;
    assert.equal((await fetch(`${base}/info`)).status, 401);
    const headers = { Authorization: `Bearer ${token}` };
    assert.equal(
      (
        await fetch(`${base}/info`, {
          headers: { ...headers, Origin: "https://untrusted.example" },
        })
      ).status,
      403,
    );
    allowed = false;
    assert.equal((await fetch(`${base}/info`, { headers })).status, 403);
    allowed = true;
    const preflight = await fetch(`${base}/info`, {
      method: "OPTIONS",
      headers: {
        Origin: "null",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
    assert.ok(preflight.status < 300);
    assert.match(
      preflight.headers.get("access-control-allow-headers") || "",
      /authorization/i,
    );
    const info = await fetch(`${base}/info`, { headers });
    assert.equal(info.status, 200);
    assert.equal((await info.json()).agents.dave.className, "DemoAgent");

    async function run(input) {
      const response = await fetch(`${base}/agent/dave/run`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(5000),
      });
      assert.equal(response.status, 200);
      assert.match(
        response.headers.get("content-type") || "",
        /text\/event-stream/,
      );
      const events = (await response.text())
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data: "))
        .map((line) => JSON.parse(line.slice(6)));
      assert.ok(events.some((event) => event.type === "RUN_STARTED"));
      assert.ok(events.some((event) => event.type === "RUN_FINISHED"));
      assert.ok(!events.some((event) => event.type === "RUN_ERROR"));
      return events;
    }

    const decision = {
      site: "youtube.com",
      reason: "The submission still needs a recording.",
      minutesLeft: 30,
      unfinished: "Record the demo",
      attentionCostMin: 3,
      recovery: { app: "Safari", urls: ["https://example.com/work"] },
      parkingCandidate: true,
      parkingTitle: "A side idea",
    };
    for (const [choice, expectedTool] of [
      ["recover", "recover"],
      ["park", "parkIdea"],
      ["correct", "correct"],
    ]) {
      const input = {
        threadId: randomUUID(),
        runId: randomUUID(),
        state: {},
        tools: [],
        context: [
          {
            description: "Current mission",
            value: JSON.stringify({
              currentStep: "Record the demo",
              nextAction: "Show the recovery result",
            }),
          },
        ],
        forwardedProps: {},
        messages: [
          {
            id: randomUUID(),
            role: "user",
            content: `ACTIVITY_DRIFT ${JSON.stringify(decision)}`,
          },
        ],
      };
      const events = await run(input);
      const calls = events.filter((event) => event.type === "TOOL_CALL_START");
      assert.deepEqual(
        calls.map((event) => event.toolCallName),
        ["driftInterrupt"],
      );
      const callId = calls[0].toolCallId;
      const args = events
        .filter(
          (event) =>
            event.type === "TOOL_CALL_ARGS" && event.toolCallId === callId,
        )
        .map((event) => event.delta)
        .join("");
      assert.deepEqual(JSON.parse(args), decision);
      const resumed = await run({
        ...input,
        runId: randomUUID(),
        messages: [
          ...input.messages,
          {
            id: randomUUID(),
            role: "assistant",
            toolCalls: [
              {
                id: callId,
                type: "function",
                function: { name: "driftInterrupt", arguments: args },
              },
            ],
          },
          {
            id: randomUUID(),
            role: "tool",
            toolCallId: callId,
            content: JSON.stringify({ choice }),
          },
        ],
      });
      const nextCalls = resumed.filter(
        (event) => event.type === "TOOL_CALL_START",
      );
      assert.deepEqual(
        nextCalls.map((event) => event.toolCallName),
        [expectedTool],
      );
    }
  },
);

test("Featherless streams a task draft, waits for review, and resumes with the result", { timeout: 15000 }, async (t) => {
  const token = randomUUID();
  let requests = 0;
  const toolArgs = JSON.stringify({ title: "Dave provider test", description: "A test draft requiring review." });
  const server = await startRuntime({ token, ai: { provider: "featherless", model: "Qwen/Qwen3-30B-A3B-Instruct-2507", apiKey: "featherless-test-only" }, fetcher: async (url, init) => {
    requests++;
    assert.equal(String(url), "https://api.featherless.ai/v1/chat/completions");
    assert.equal(new Headers(init.headers).get("Authorization"), "Bearer featherless-test-only");
    const body = JSON.parse(init.body);
    assert.equal(body.model, "Qwen/Qwen3-30B-A3B-Instruct-2507");
    assert.equal(body.stream, true);
    assert.equal(body.tool_choice, "auto");
    assert.deepEqual(body.chat_template_kwargs, { enable_thinking: false });
    assert.ok(body.tools.some((tool) => tool.function.name === "draftAmbiguousTask"));
    const resumed = body.messages.some((message) => message.role === "tool");
    const chunk = (delta, finish_reason = null) => ({ id: "test", object: "chat.completion.chunk", created: 1, model: body.model, choices: [{ index: 0, delta, finish_reason }] });
    const chunks = resumed
      ? [chunk({ role: "assistant", content: "Task created after your review." }), chunk({}, "stop")]
      : [chunk({ role: "assistant", tool_calls: [{ index: 0, id: "review_call", type: "function", function: { name: "draftAmbiguousTask", arguments: toolArgs } }] }), chunk({}, "tool_calls")];
    return new Response(chunks.map((c) => "data: " + JSON.stringify(c) + "\n\n").join("") + "data: [DONE]\n\n", { headers: { "Content-Type": "text/event-stream" } });
  } });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/copilotkit`;
  const input = { threadId: randomUUID(), runId: randomUUID(), state: {}, context: [], forwardedProps: {}, messages: [{ id: randomUUID(), role: "user", content: "Draft an Ambiguous task for review." }], tools: [{ name: "draftAmbiguousTask", description: "Show a draft for human review. Wait for the user to confirm or cancel.", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] } }] };
  async function run(value) {
    const response = await fetch(base + "/agent/dave/run", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", Accept: "text/event-stream" }, body: JSON.stringify(value), signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    return (await response.text()).split(/\r?\n/).filter((line) => line.startsWith("data: ")).map((line) => JSON.parse(line.slice(6)));
  }
  const events = await run(input);
  assert.ok(!events.some((e) => e.type === "RUN_ERROR"));
  assert.equal(events.find((e) => e.type === "TOOL_CALL_START").toolCallName, "draftAmbiguousTask");
  assert.equal(requests, 1, "No second model call before the user responds");
  const call = events.find((e) => e.type === "TOOL_CALL_START");
  const args = events.filter((e) => e.type === "TOOL_CALL_ARGS").map((e) => e.delta).join("");
  assert.deepEqual(JSON.parse(args), JSON.parse(toolArgs));
  const continuation = await run({ ...input, runId: randomUUID(), messages: [...input.messages, { id: randomUUID(), role: "assistant", toolCalls: [{ id: call.toolCallId, type: "function", function: { name: "draftAmbiguousTask", arguments: args } }] }, { id: randomUUID(), role: "tool", toolCallId: call.toolCallId, content: JSON.stringify({ id: "confirmed-test-task" }) }] });
  assert.ok(!continuation.some((e) => e.type === "RUN_ERROR"));
  assert.match(continuation.filter((e) => e.type === "TEXT_MESSAGE_CONTENT").map((e) => e.delta).join(""), /after your review/);
  assert.equal(requests, 2);
});

test("provider authentication errors reach the chat as safe error events", { timeout: 15000 }, async (t) => {
  const token = randomUUID();
  const server = await startRuntime({ token, ai: { provider: "featherless", model: "test", apiKey: "invalid-test-key" }, fetcher: async () => Response.json({ error: { message: "Unauthorized private-request-secret" } }, { status: 401 }) });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/copilotkit/agent/dave/run`, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", Accept: "text/event-stream" }, body: JSON.stringify({ threadId: randomUUID(), runId: randomUUID(), state: {}, tools: [], context: [], forwardedProps: {}, messages: [{ id: randomUUID(), role: "user", content: "Hello" }] }) });
  const events = await response.text();
  assert.match(events, /RUN_ERROR/);
  assert.match(events, /rejected the key/);
  assert.ok(!events.includes("private-request-secret"));
});
