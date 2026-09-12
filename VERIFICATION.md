# Dave verification and judging evidence

## What is in the repository

`dave-app/` contains the Electron application, React interface, macOS activity watcher, local state, CopilotKit runtime, OpenAI configuration, and recovery tools. `docs/` contains the presentation website, browser scenario, and recording. The browser scenario is scripted; the Electron app also has a normal mode that uses live activity and a configured model.

## Checks completed on 12 September 2026

Command: `cd dave-app && npm run verify`

- TypeScript: no errors.
- Unit tests: 10 passed.
- Production build: main process, preload, and renderer built.
- HTTP integration test: passed against the compiled CopilotKit runtime using its deterministic demo agent.

The HTTP test checks `/api/copilotkit/info` and `/api/copilotkit/agent/dave/run`. A drift event emits `driftInterrupt` without an action. Providing the user's choice emits exactly the corresponding `recover`, `parkIdea`, or `correct` tool. All three choices are exercised over HTTP and streamed AG-UI events.

This verifies runtime wiring and decision flow. It does not establish that the OpenAI-backed classifier or macOS recovery succeeds on a user's machine.

## Fit with the judging criteria

| Criterion | Evidence | Remaining verification |
| --- | --- | --- |
| Core requirements and functionality | Mission, watcher, classifier path, interruption policy, user choice, and action handlers are implemented. | Run the complete flow with an OpenAI key and macOS permissions. |
| Innovation and theme alignment | The active app, current page, and activity trail are assessed against the user's mission. Recovery reopens relevant work. | Show why the same page can be relevant to one mission and unrelated to another. |
| Technical execution and integration | Electron, React, CopilotKit, AG-UI, Hono, Zod, macOS scripting, and persisted JSON state are connected. Automated checks pass. | Verify permission denial and model failure in the running desktop app. |
| Usefulness and agentic experience | Users can recover, park an idea, or correct the classification. Corrections suppress interruptions for that mission. | Show a saved idea after restart and a successful return to the work app. |

## Presentation and submission status

- The GitHub repository and website are publicly reachable.
- The [LinkedIn post](https://www.linkedin.com/posts/pavliscak_agentseverywhere-share-7504532856879218688-AVCb/) is public, includes `#AgentsEverywhere`, and tags the event partners listed in the submission form.
- The team confirmed that the core was built during the official hackathon window.
- Loom's published playable duration is 120.157 seconds. The checked-in MP4 is 120.157 seconds. Trim at least one second from the published video to remain below the two-minute limit.
- The attached Attention Bunny document is an internal product brief. It is not the organizer's rulebook. The local participant portal controls the actual deadline.

## Remaining product limits

- Calendar context is empty. Deadlines are supplied with the mission.
- The watcher reads app, title, and supported browser URL. It does not extract page content.
- Parked ideas are local records; no external calendar event or reminder is created.
- Ambiguous integration is not implemented.
- Full desktop and credential-backed model behavior still need end-to-end verification.

## Rule sources

- [CopilotKit's event handbook summary](https://github.com/CopilotKit/agents-everywhere-starter-kit/blob/main/hackathon-rules.md): new core work during the event, reusable libraries allowed, public deliverables, and accurate demo claims.
- [Published judging criteria summary](https://github.com/CopilotKit/agents-everywhere-starter-kit/blob/main/hackathon-overview.md): four criteria, with one complete interaction and a visible result.

The starter-kit summaries defer to the local organizer's current rules. Prague's participant handbook was not independently accessible during this review.
