# Dave hackathon readiness

Reviewed 14 September 2026 against the supplied three-page screenshot of the [Agents, Everywhere event page](https://prague.aitinkerers.org/hackathons/h_Ka2GSP4Y_JU) and the opening-session transcript supplied in this conversation. Transcript references below use elapsed recording time. Several names and product terms were transcribed incorrectly; they are not used as technical specifications or credit codes.

Dave's strongest demo is one unfinished piece of work carried from a ChatGPT conversation into a reviewed task, through a small agent action, and back to its source. The browser supplies the source and destination; CopilotKit presents the proposal and result; an Ambiguous coworker produces a document linked to the task. The coworker stage is proposed work, not an implemented feature.

## What the opening session adds

| Recording time | Statement or demonstration | Implication for Dave |
| --- | --- | --- |
| 01:29 | The local organizer describes a two-minute pitch video and a social post linking a public repository. Local presentations are optional. | Plan a 120-second pitch containing a 90-second demo. Verify access to the repository, video, and linked post. This is a spoken submission instruction; it does not establish permission to replace a submitted build. |
| 04:57-05:31 | The global introduction places agents in the browser and other places people already work. | Show the existing ChatGPT tab and Dave's floating panel throughout the core workflow. |
| 08:46-09:30 | The CopilotKit segment discusses learning from interactions and corrections. | Show how an edited proposal changes the accepted task. Treat learning that persists across sessions as a separate feature with its own evidence. |
| 09:30-10:14 | The CopilotKit speaker recommends generative UI and interactive application components. | Make editable mission/task cards, progress, cancellation, and result actions visible in the demo. |
| 17:58-22:01 | Ambiguous demonstrates a named agent, assigned work, a resulting artifact, and an audit trail. | Add one bounded worker action with a named identity, a real output, and task status readback. |

These sponsor demonstrations inform the proposed demo. They are not additional judging requirements. CopilotKit's current [Generative UI documentation](https://docs.copilotkit.ai/concepts/generative-ui-overview) supports tool cards and streamed state as application components.

## What the judges assess

The rubric scores four criteria from 1 to 5. It describes complete, reliable behavior in the intended environment, a use case shaped by that environment, technical integration with failure handling, and useful agent actions the user can understand and control. The screenshot also lists separate prizes for Best Use of CopilotKit and Best Use of Ambiguous AI. It does not provide separate scoring rubrics for those prizes.

| Criterion | Evidence Dave should show | Current gap |
| --- | --- | --- |
| Core Requirements & Functionality | Select a chat, review a next action, create a task, and return to the source in one session. | Live Featherless replies and reviewed Ambiguous task creation passed. The full selected-chat-to-task demonstration still needs recording. |
| Innovation & Theme Alignment | Preserve unfinished work while the user switches between chats and apps. Use the actual source tab and its selected context. | The return action works. Context-based mission proposals and focus recovery still need a live demonstration. |
| Technical Execution & Integration | Show verified task IDs, persisted state, and clear results when access expires or a request fails. | The 0.3.1 app displays API failures. Restart, background-tab, and reconnect behavior need live checks. |
| Usefulness & Agentic Experience | Propose a concrete next action, let the user edit or reject it, then show what was saved and where. | Ambiguous task status is available through manual refresh. The task does not yet remain linked to a Dave mission through completion. |

These are readiness gaps, not predicted judging scores.

## Verified on this Mac

- The installed Chrome extension previewed recent messages from a saved conversation.
- Connecting that conversation displayed its title and available actions in the packaged Dave app.
- After opening a different Chrome tab, Return to chat activated the original conversation.
- Dave saved the supplied Ambiguous key through its encrypted credential storage.
- Dave created an unassigned task named `Dave connection test`, received its `todo` status, and retrieved it through Load 25 recent tasks.
- A dedicated OpenAI key named `Dave Mac alpha` was created in Default project with restricted Responses and Chat Completions access. It expires on 14 October 2026 and is stored encrypted in Dave.

The created Ambiguous test task ID is `dd91a32b-89f1-43b5-8e36-87b23fb59e32`. This is a test record, not evidence that an AI coworker executed work.

The 0.3.1 build passed TypeScript, production compilation, and 44 automated tests, including Featherless streaming, task review and continuation, and sanitized authentication errors. Automated tests use simulated provider responses and do not establish live model behavior.

## Provider status

The user approved a dedicated Featherless key named `Dave Mac alpha`. Dave saved it encrypted, and a live Ask Dave request returned “Dave is ready.” The Featherless account had $24.88 available before this trial. The earlier supplied key was rejected with HTTP 401.

A live Qwen tool request initially ended with an empty stream. Setting `chat_template_kwargs.enable_thinking` to false resolved it. The rebuilt packaged app passed the real review flow: propose, cancel without creating a task, propose again, edit the description, approve, receive the task ID, and load the task back from Ambiguous.

The reviewed test task is `Dave live integration test`, ID `0a7ad9ed-0750-46b2-afc7-077854ab0104`, status `todo`. Its description retains the edit made before approval. The cancelled proposal, `Dave cancellation test`, produced no outbox entry and was absent from the retrieved task list. The model resumed after both cancellation and successful creation. A separate live classifier check used a synthetic Notes window and mission, returned schema-valid JSON, and reported 225 tokens. Activity tracking remained disabled throughout the test.

The OpenAI account's billing page showed $0.00 in API credit. Its credit-grants page contained only an expired $18 grant, and the organization selector listed only Personal. A minimal Ask Dave request finished without an answer or a visible error. The user subsequently chose Featherless. OpenAI would require available API billing before another test. No payment was made.

The user's redeemed hackathon award was found: the Codex account reports a balance of 1,250 credits. The private event offer identifies this as $50 of Codex usage, separate from API credit and the ChatGPT subscription, with expiry 30 days after redemption. These credits can support development in Codex; they do not fund Dave's current OpenAI API runtime. The exact redemption timestamp was not established.

Dave uses the CopilotKit SDK and a local runtime. The signed-in CopilotKit Intelligence organization has no projects. An Intelligence key is not required for the current implementation and does not replace a model-provider key. Connecting Intelligence would add hosted conversation storage and needs an explicit product decision about which data leaves the Mac. See [CopilotKit runtime setup](https://docs.copilotkit.ai/ms-agent-dotnet/intelligence/connect-your-runtime) and [CLI prerequisites](https://docs.copilotkit.ai/cli).

## Finish these in order

1. **Connect the complete demo.** Live AI replies and reviewed task creation now pass. Use a short, non-sensitive ChatGPT conversation, share the selected excerpt with Ask Dave, and repeat the workflow while recording.
2. **Make the saved result easy to revisit.** The task currently appears through Connect and Load 25 recent tasks. Keep a direct task result in the mission view.
3. **Keep the source attached to the task.** Persist the relationship between the Dave mission, conversation URL, and Ambiguous task ID. Show the current task status beside Return to chat. Make completion a reviewed action and verify it by reading the task back.
4. **Run one bounded coworker task.** Give a dedicated Dave worker an Ambiguous identity and a running agent process. Use one job: turn the approved conversation excerpt into an implementation checklist in Ambiguous Docs. Show its task assignment, actual progress, document link, and recorded result. Creating an agent account alone does not execute work.
5. **Handle an interruption.** Pause Dave, resume it, reload the chat, and restart the app. Show when reconnecting is required. A missing or stale tab must not redirect an action to another chat.
6. **Record the working workflow.** Capture the actual app and browser. Document the tested version and current limitations alongside the recording. Preserve the original concept video as a concept demo.

## Smallest coworker implementation

The worker executes a typed checklist job. It receives only the reviewed excerpt and acceptance criteria attached to its task. Conversation text is input data and cannot change the worker's permitted actions.

- Provision a named worker in the existing workspace. Verify the service's available role and key restrictions before selecting credentials.
- Run the worker as part of the Dave app's lifetime for the first version. Show that the worker is offline when Dave quits; do not promise unattended execution.
- Accept tasks assigned to that worker by Dave, identified by task ID and a persisted job record. Ignore unrelated workspace tasks.
- Use a structured model response to draft a checklist. Include the source conversation URL and separate explicit requirements from assumptions.
- Create one Ambiguous document, persist its ID, read it back, and link it to the task. Record failure or an uncertain write without automatically creating a second document.
- Display waiting, running, needs review, and failed states from the worker's actual execution. These are proposed Dave states; map them to verified Ambiguous fields during implementation.
- Let the user review the document before confirming completion. Read the resulting task status back.

Acceptance: an edited proposal changes the worker's input; cancellation creates no remote task; one approved task creates one document; restart does not repeat a completed write; model failure never appears as completion. A separate live test must establish which actions appear in Ambiguous's audit history.

The existing user-owned API key and unassigned test task do not establish any of this worker behavior. No coworker has been provisioned or launched by this review.

## Two-minute pitch target

Use 15 seconds to show the problem, 90 seconds for the workflow below, and 15 seconds to explain the three integrations and state the tested limits. Keep the total at 120 seconds, matching the organizer's spoken instruction. The complete sequence has not yet been verified.

| Time | Action | Visible proof |
| --- | --- | --- |
| 0-15 s | Open a short planning conversation and connect it to Dave. | The selected title and bounded excerpt appear in Dave. |
| 15-35 s | Ask Dave for the next action. | CopilotKit renders an editable task proposal grounded in the excerpt. |
| 35-50 s | Refine the proposal and assign it to the Dave worker in Ambiguous. | A confirmed task ID and named assignee appear. |
| 50-70 s | Show the worker creating the checklist, then switch away and use Return to chat. | A real document link appears; Chrome returns to the exact source tab. |
| 70-90 s | Review the document and confirm task completion. | The accepted result and task status agree in Dave and Ambiguous. |

Keep the coworker job small enough to complete within a measured demo run. If execution takes longer, label any recording cuts and elapsed time. Do not present simulated progress as a live result.

CopilotKit's contribution should be visible in context-aware proposals, editable cards, cancellation, progress, and confirmed tool results. Ambiguous's contribution should be visible in assigned work, a document, status readback, and the available audit history. If only the current task creation and retrieval work, describe that tested scope in the recording.

The sponsor talk also mentions learning. Dave currently has local focus corrections; that is not proof of CopilotKit Intelligence learning. Test persisted learning only after the main workflow succeeds and the relevant data-sharing behavior is chosen.

## Not established

The current tests do not verify native ChatGPT conversation access, automatic sending, Stop response, scheduled-task management, coworker execution, second-Mac installation, or the full live focus-classification loop. The supplied screenshot does not establish whether later builds can replace the submitted version. Keep verification dates and demo labels accurate.
