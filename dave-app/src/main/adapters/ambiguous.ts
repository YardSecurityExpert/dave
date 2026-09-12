import { z } from "zod";
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import type { AmbiguousDraft, AmbiguousTask } from "../../shared/integrations";
export const ambiguousDraft = z.object({
  requestId: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000),
});
const task = z.object({
  id: z.string().uuid(),
  title: z.string().max(1000),
  status: z.string().max(100),
  description: z.string().nullable().optional(),
});
export class AmbiguousAdapter {
  private generation = 0;
  private controllers = new Set<AbortController>();
  private pending = false;
  private unreadable = false;
  private outbox: Record<
    string,
    { state: "pending" | "done"; task?: AmbiguousTask }
  > = {};
  private path: string;
  constructor(
    private key: () => string | undefined,
    directory: string,
    private fetcher: typeof fetch = fetch,
  ) {
    this.path = join(directory, "ambiguous-outbox.json");
    if (existsSync(this.path)) {
      try {
        this.outbox = z
          .record(
            z.object({
              state: z.enum(["pending", "done"]),
              task: task.optional(),
            }),
          )
          .parse(JSON.parse(readFileSync(this.path, "utf8")));
      } catch {
        this.unreadable = true;
      }
    }
  }
  cancel() {
    this.generation++;
    for (const c of this.controllers) c.abort();
    this.controllers.clear();
  }
  private save() {
    writeFileSync(this.path + ".tmp", JSON.stringify(this.outbox), {
      mode: 0o600,
    });
    renameSync(this.path + ".tmp", this.path);
  }
  private async request(path: string, body?: unknown) {
    const key = this.key();
    if (!key) throw new Error("Add your Ambiguous API key in Connections.");
    const generation = this.generation,
      controller = new AbortController();
    this.controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const result = await this.fetcher("https://app.ambiguous.ai/api" + path, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          "API-Version": "1",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        redirect: "error",
      });
      if (!result.ok)
        throw new Error(
          result.status === 401
            ? "Ambiguous rejected the API key."
            : `Ambiguous request failed (${result.status}).`,
        );
      const data = await result.json();
      if (generation !== this.generation)
        throw new Error("Ambiguous connection changed.");
      return data;
    } finally {
      clearTimeout(timeout);
      this.controllers.delete(controller);
    }
  }
  async list() {
    return z
      .object({ data: z.array(task).max(50) })
      .parse(await this.request("/tasks?limit=25&sort=updated_at")).data;
  }
  async create(input: AmbiguousDraft) {
    if (this.unreadable)
      throw new Error(
        "Dave could not read its Ambiguous request history. Task creation is disabled until that file is recovered.",
      );
    const value = ambiguousDraft.parse(input);
    const existing = this.outbox[value.requestId];
    if (existing?.state === "done") return existing.task!;
    if (existing || this.pending)
      throw new Error(
        "Check Ambiguous before trying again: an earlier task request may already have succeeded.",
      );
    if (!this.key()) throw new Error("Add your Ambiguous API key first.");
    if (Object.keys(this.outbox).length >= 1000)
      throw new Error(
        "The task request history is full. Export and review it before sending more tasks.",
      );
    this.outbox[value.requestId] = { state: "pending" };
    this.save();
    this.pending = true;
    try {
      const result = task.parse(
        (
          await this.request("/tasks", {
            title: value.title,
            description: value.description,
          })
        ).task,
      );
      this.outbox[value.requestId] = { state: "done", task: result };
      this.save();
      return result;
    } catch (error) {
      throw new Error(
        (error instanceof Error ? error.message : "Task request failed.") +
          " Check Ambiguous before creating another copy.",
      );
    } finally {
      this.pending = false;
    }
  }
}
