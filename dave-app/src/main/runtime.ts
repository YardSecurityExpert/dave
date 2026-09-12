import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serve } from "@hono/node-server";
import { DemoAgent } from "./demo-agent";
import { SYSTEM_PROMPT } from "./prompt";
import type { Server } from "node:http";
import { createOpenAI } from "@ai-sdk/openai";
import type { AIConfiguration } from "../shared/ai";
import { aiErrorMessage } from "../shared/ai-errors";
export async function startRuntime(options: {
  demo?: boolean;
  port?: number;
  token: string;
  allowed?: () => boolean;
  ai?: AIConfiguration;
  fetcher?: typeof fetch;
}) {
  if (options.token.length < 32)
    throw new Error("A per-launch runtime credential is required");
  const demo = options.demo ?? process.env.DAVE_DEMO === "1";
  if (!demo && !options.ai?.apiKey) throw new Error("An AI provider key is required");
  const stopped = new AbortController();
  const providerFetch: typeof fetch = async (url, init) => {
    // Featherless's Qwen Instruct stream can end empty when thinking is implicit.
    // Dave uses non-thinking mode for short replies and human-reviewed drafts.
    const body = options.ai?.provider === "featherless" && typeof init?.body === "string"
      ? JSON.stringify({ ...JSON.parse(init.body), chat_template_kwargs: { enable_thinking: false } })
      : init?.body;
    const response = await (options.fetcher ?? fetch)(url, {
      ...init,
      body,
      redirect: "error",
      signal: AbortSignal.any([stopped.signal, AbortSignal.timeout(60000), ...(init?.signal ? [init.signal] : [])]),
    });
    if (response.ok) return response;
    const detail = await response.text();
    return new Response(JSON.stringify({ error: { message: aiErrorMessage(response.status + " " + detail), type: "provider_error" } }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  };
  const dave =
    demo
      ? new DemoAgent({
          agentId: "dave",
          description: "Deterministic local demonstration",
        })
      : new BuiltInAgent({
          model: options.ai?.provider === "featherless"
            ? createOpenAI({
                apiKey: options.ai.apiKey,
                baseURL: "https://api.featherless.ai/v1",
                headers: { "HTTP-Referer": "https://thedave.app", "X-Title": "Dave" },
                fetch: providerFetch,
              }).chat(options.ai.model)
            : createOpenAI({ apiKey: options.ai?.apiKey, fetch: providerFetch }).responses(options.ai?.model ?? "gpt-5.4-mini"),
          prompt: SYSTEM_PROMPT,
          maxSteps: 3,
          toolChoice: "auto",
          maxOutputTokens: 2048,
        });
  const runtime = new CopilotRuntime({ agents: { dave } });
  const origins = [
    ...(process.env.ELECTRON_RENDERER_URL
      ? [new URL(process.env.ELECTRON_RENDERER_URL).origin]
      : []),
    "null",
  ];
  const handler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit",
    cors: {
      origin: origins,
      allowHeaders: [
        "Authorization",
        "Content-Type",
        "Accept",
        "X-CopilotKit-Version",
      ],
    },
  });
  const server = new Hono();
  server.use("*", bodyLimit({ maxSize: 128 * 1024 }));
  server.use("*", async (c, next) => {
    if (new URL(c.req.url).hostname !== "127.0.0.1")
      return c.text("Forbidden", 403);
    const origin = c.req.header("origin");
    if (origin && !origins.includes(origin)) return c.text("Forbidden", 403);
    if (c.req.method !== "OPTIONS") {
      if (c.req.header("authorization") !== "Bearer " + options.token)
        return c.text("Unauthorized", 401);
      if (options.allowed && !options.allowed())
        return c.text("AI is paused or disabled", 403);
    }
    await next();
  });
  server.all("/api/copilotkit/*", (c) => handler(c.req.raw));
  return await new Promise<Server>((resolve, reject) => {
    const instance = serve(
      { fetch: server.fetch, port: options.port ?? 0, hostname: "127.0.0.1" },
      () => resolve(instance as Server),
    );
    instance.on("error", reject);
    instance.once("close", () => stopped.abort());
  });
}
