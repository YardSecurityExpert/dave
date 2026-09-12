import { AbstractAgent } from "@ag-ui/client";
import type { BaseEvent, RunAgentInput } from "@ag-ui/core";
import { Observable } from "rxjs";
import { demoEvents } from "./demo-protocol";
export class DemoAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable((subscriber) => {
      try {
        for (const event of demoEvents(input)) subscriber.next(event);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }
}
