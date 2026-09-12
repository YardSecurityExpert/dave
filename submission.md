# MMLV project submission

## Team Name

MMLV

## Project Name

Dave

## Project Description

Dave is a macOS menu bar agent prototype that helps people return to their intended work when attention drifts. The user declares a mission, current step, and deadline. Dave uses the active application, window title, supported browser URL, and recent activity trail to assess whether the current activity serves that mission. Relevance depends on intent: the same page can be useful research or a sidetrack.

When a classification indicates distraction, a local policy checks confidence, dwell time, previous corrections, and cooldown before interrupting. Dave explains the interruption and asks the user to choose: return to relevant work, park the idea for later, or mark the activity as useful. Recovery can reactivate the work application and reopen relevant URLs. Parked ideas and corrections persist locally.

The surrounding desktop is essential to this workflow. It supplies the context the user would otherwise need to explain, and it gives the agent actions that restore the user's work. The user retains control through the recovery choice and can correct a mistaken classification.

The application uses Electron, TypeScript, React, CopilotKit, AG-UI, Hono, and Zod. The main process reads macOS activity through JavaScript for Automation and persists state to JSON. CopilotKit supplies shared context, frontend tools, agent state, and human-in-the-loop interactions. Normal mode is configured to use an OpenAI model through the CopilotKit runtime.

A credential-free demo uses deterministic AG-UI events through the same runtime. The separate browser presentation follows Joe's afternoon with simulated messages and coding sessions. The production build, TypeScript check, ten unit tests, and a compiled-runtime HTTP integration test pass. The complete macOS interface and credential-backed model flow still need end-to-end verification. Calendar and Ambiguous integrations are not implemented.

## Products & Tools Used

- OpenAI: model-provider integration, Codex for development, and image generation for the visual identity.
- CopilotKit: runtime, agent context and state, frontend tools, and human-in-the-loop interruption flow.

Other products: Electron, TypeScript, React, AG-UI, Hono, Zod, Node.js, macOS JavaScript for Automation, and GitHub Pages.

Additional event sponsors are acknowledged in the public post. They are not listed as implemented integrations.

## Project Video

[Dave demo on Loom](https://www.loom.com/share/6d221f20fdcf4f3fb8f6f96c6c1e2e2c)

Published playable runtime verified from Loom metadata: 2:00.157. Trim at least one second to stay under the two-minute limit.

## Team Contributions

**Lukas Chudy (Lead)**

Led scientific research to inform the project’s approach to attention, distraction, and focus interventions.

**Matúš Pavliščák (Member)**

Led app implementation and the interactive demo, including desktop behavior and agent integration. Used OpenAI Codex for development and CopilotKit for agent context, tools, state, and the interruption workflow.

**Michal Najman (Member)**

Originated the project idea and led the product vision, defining the problem Dave addresses and the intended user experience.

**Vladyslav Babyč (Member)**

Developed the branding and contributed research and infrastructure work supporting the project.

## Additional Links

https://github.com/YardSecurityExpert/dave

Title: Dave project repository and implementation brief

Project website: https://YardSecurityExpert.github.io/dave/

## Prior Work

The team confirms that Dave’s core functionality was built during the official hackathon window. Existing building blocks include Electron, React, CopilotKit, AG-UI, Hono, Zod, and standard development tools. The project-specific work includes the mission and activity workflow, drift policy, desktop recovery, idea parking, relevance corrections, branding, and demo scenario.

## Social Media Post

https://www.linkedin.com/posts/pavliscak_agentseverywhere-share-7504532856879218688-AVCb/

The post is public, includes #AgentsEverywhere, and tags AI Tinkerers, OpenAI, CopilotKit, OpenRouter, Exa, Auth0, Ambiguous, Trigger.dev, Mozilla.ai, and Google Cloud.
