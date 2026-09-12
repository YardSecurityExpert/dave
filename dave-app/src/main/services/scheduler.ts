import type { Classifier, Snapshot } from "./classifier";
import type { AgentState } from "../../shared/types";
export class ClassificationScheduler {
  private running = false;
  private controller?: AbortController;
  private generation = 0;
  private nextRequestAt = 0;
  private context = "";
  private completedAt = -Infinity;
  private failures = 0;
  constructor(
    private classify: Classifier,
    private clock = Date.now,
  ) {}
  cancel() {
    this.generation++;
    this.controller?.abort();
    this.context = "";
    this.completedAt = -Infinity;
    this.failures = 0;
  }
  async offer(
    snapshot: Snapshot,
    callbacks: {
      started: () => void;
      result: (agent: AgentState, tokens: number) => void;
      error: (message: string) => void;
      usage: (tokens: number) => void;
    },
  ): Promise<void> {
    const now = this.clock();
    const key = snapshot.missionRevision + ":" + snapshot.activityId;
    if (key !== this.context) {
      this.context = key;
      this.failures = 0;
      this.completedAt = -Infinity;
    }
    if (
      this.running ||
      now < this.nextRequestAt ||
      now - this.completedAt < 60000 ||
      this.failures >= 3
    )
      return;
    this.running = true;
    this.nextRequestAt = now + 30000;
    const generation = this.generation;
    const controller = new AbortController();
    this.controller = controller;
    try {
      callbacks.started();
      const { agent, tokens } = await this.classify(
        structuredClone(snapshot),
        controller.signal,
      );
      callbacks.usage(tokens);
      if (
        generation !== this.generation ||
        controller.signal.aborted ||
        key !== this.context
      )
        return;
      this.completedAt = this.clock();
      this.failures = 0;
      callbacks.result(agent, tokens);
    } catch (error) {
      if (generation === this.generation && !controller.signal.aborted) {
        this.failures++;
        this.nextRequestAt =
          this.clock() + Math.min(300000, 30000 * 2 ** this.failures);
        callbacks.error(
          (error instanceof Error ? error.message : "Classification failed.") +
            (this.failures >= 3 ? " Retry by pausing and resuming Dave." : ""),
        );
      }
    } finally {
      this.running = false;
      if (this.controller === controller) this.controller = undefined;
    }
  }
}
