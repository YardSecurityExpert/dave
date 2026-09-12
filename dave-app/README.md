# Dave for Mac

A menu bar focus companion built with Electron, React, TypeScript, CopilotKit, and a bundled Swift helper. This is a local alpha for Apple Silicon, targeting macOS 14 or later.

## Run and package

Development requires Node 22 and Apple Command Line Tools.

```sh
npm ci
npm run dev
```

For a demo with simulated activity and separate saved data:

```sh
npm run demo
```

Create the local app and DMG:

```sh
npm run package:mac
```

The app and installer appear in `~/Downloads/Dave-macOS-alpha/`. Release builds use `~/Downloads/Dave-macOS-release/`. `dist/last-build.json` records the app bundle's location. Packaging uses Downloads because iCloud adds Finder metadata to bundles in Documents, which macOS code signing rejects. Quit Dave before rebuilding. The local build uses an ad-hoc signature; it is not a notarized public release.

Dave stays visible when another app takes focus, including ChatGPT. Use Hide or the tray icon to close the panel. The 0.3.1 alpha includes the [Chrome helper](../dave-extension/README.md) for selected ChatGPT conversations. The build also puts `Dave-Chrome-helper/` and its ZIP beside the installer in Downloads. Native ChatGPT conversation reading remains in the [integration plan](../DAVE_CHATGPT_INTEGRATION_PLAN.md).

In **Connect**, install the Chrome native registration and load the unpacked extension using its setup instructions. Connected chats support excerpt review, mission pinning, returning to an existing tab, local idea saving, and filling an empty ChatGPT composer. Dave never submits that draft. Live Chrome excerpt preview, connection, and return to the correct tab passed on 14 September 2026. Draft insertion and native app recovery still need live checks.

**Use this chat in Ask Dave** explicitly shares one connected excerpt with the selected AI provider through CopilotKit. It does not enable page-body sharing for the background classifier. Pause, idle, lock, or disconnect clears the shared excerpt. Changing the connection, AI provider, or model resets Ask Dave's runtime and clears the prior shared context.

The Ambiguous connection encrypts its API key in `ambiguous-credentials.bin`. It loads up to 25 recent workspace tasks and creates an unassigned task from reviewed title/description fields. CopilotKit can propose that task through a review card. The adapter stores request outcomes in `ambiguous-outbox.json` and refuses to repeat an uncertain creation. Live authenticated task creation and retrieval passed on 14 September 2026. Its task records do not provide ChatGPT session controls.

`npm run dist:mac` requires a Developer ID Application identity and Apple notarization credentials. The script validates their presence before packaging. It does not publish anything.

## Try the alpha

1. Set a mission and the step you want to finish.
2. In Settings, enable activity access and grant Accessibility. Enable Chrome or Safari separately to include browser context.
3. Open the work window, return to Dave, and choose **Pin last active window**. **Return to work** activates that saved destination. For supported browsers, Dave looks for the existing tab before opening one fallback URL in the same browser.
4. Save an idea, edit its note or revisit time, open its link, or mark it complete.
5. Add a commitment and your travel allowance. Dave computes when to leave and shows one reminder five minutes beforehand.
6. Use **Pause 15 min**, **Pause today**, **Resume**, or **Complete mission** as needed.

**Preview a gentle nudge** exercises the local interruption panel without classifying your activity. Its save and dismiss actions work without an API key. Recovery requires a pinned destination. A preview cannot record a relevance correction.

## Activity and AI

Activity access, browser access, AI, and automatic nudges start disabled. The helper reads the frontmost app and focused window title. Browser access adds the active tab URL and title. Chrome incognito windows are skipped. Safari private windows cannot be reliably identified; leave Safari access off when browsing privately. Arc, Brave, Edge, and Firefox are skipped in this alpha.

App exclusions apply before the helper reads window content. Domain exclusions apply before retaining an observation or sending it to the classifier. Dave stops observing while paused, idle for a minute, or screen-locked. It collects no screenshots, keystrokes, or clipboard contents. The separate Chrome helper reads selected conversation excerpts as described above.

With AI enabled, classification sends the chosen mission and current app, title, and URL to the selected provider, OpenAI or Featherless. It removes URL query strings and fragments and rejects URLs with embedded credentials. It requests validated JSON with no action tools. OpenAI uses Responses with `store: false`; Featherless uses Chat Completions with JSON mode. Featherless requests explicitly disable thinking for short replies, classification, and reviewed drafts; its Qwen Instruct tool stream otherwise returned empty in the live test. Ask Dave sends the mission, upcoming manual commitments, and chat messages. The chat does not receive activity history, parked ideas, or runtime credentials.

Choose an AI provider and model in Settings, save settings, then enter its API key. The Featherless default is `Qwen/Qwen3-30B-A3B-Instruct-2507`, which supports tool calls. Dave encrypts keys with Electron `safeStorage`, backed by macOS Keychain. OpenAI uses `credentials.bin`; Featherless uses `featherless-credentials.bin`. Switching providers preserves each key separately. Removing the OpenAI key also disables fallback to a legacy `.env` key. Featherless never falls back to an OpenAI key. Ask Dave displays provider failures and empty responses with a next step. API charges belong to the supplied key. The configurable daily request cap covers background classification; chat usage is separate.

The main process owns classification, independent of the popover and chat. It allows one request in flight, waits for ten seconds of stable context, enforces a thirty-second minimum request interval, and refreshes a completed classification after sixty seconds. Failures back off and stop after three attempts for that context. Pause/resume permits another attempt. Snapshot IDs and mission revisions prevent delayed responses from classifying a different activity.

Automatic nudges are experimental and remain off by default. The policy requires ninety seconds of active dwell, confidence of at least 0.7, and a ten-minute cooldown. Corrections apply to the exact activity within the mission. A relevance correction does not exempt the whole domain.

## Saved data

Normal mode uses `~/Library/Application Support/dave-app/`; demo mode uses `dave-app-demo/`. The path remains stable across packaging and product-name changes.

Version 2 saves missions, commitments, parked ideas, a recovery destination, corrections, settings, cooldown, and usage counters. The last thirty activity segments stay in memory. Runtime tokens and raw activity do not enter `state.json`.

Migration preserves the original file as `state-v1.backup.json`, retains intentional records, and starts with observation disabled. It does not apply old domain-wide corrections. The backup contains the original prototype data, including any history it saved. Unreadable data also receives a separate backup before Dave starts with defaults.

The local CopilotKit server uses an ephemeral loopback port, a random per-launch credential, origin validation, and bounded request bodies. Renderer IPC is restricted to the app's main frame.

## Verification and remaining work

```sh
npm run verify
```

This runs TypeScript, unit scenarios, native compilation, the renderer/main build, authenticated HTTP runtime tests, and the helper protocol test. The deterministic AG-UI demo tests remain transport regression fixtures. They do not drive the production interruption policy.

The 0.3.1 packaged app passed a live Featherless reply, task proposal cancellation, edited proposal approval, Ambiguous task creation, and retrieval. The approved key is encrypted and the provider settings survive restart. Authentication errors also display correctly. The alpha also needs packaged Accessibility/Automation recovery checks, accuracy evaluation, and testing on a second Mac. Calendar/Reminders integration, task-provider completion events, session pause/resume integrations, and signed updates remain in the [macOS plan](../DAVE_MACOS_PLAN.md).
