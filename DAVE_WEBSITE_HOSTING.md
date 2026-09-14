**Dave website hosting · 14 September 2026**

The landing page and interactive demo are deployed at [thedave.app](https://thedave.app/) through Cloudflare Pages project `thedave`. The fallback hostname is [thedave.pages.dev](https://thedave.pages.dev/).

The deployment contains the 19 public files from `docs/`, excluding the GitHub-specific `.nojekyll` marker. `index.html` is the landing page; `demo.html` is the interactive demo. App source, local settings, and the macOS build plan are outside the published directory.

Cloudflare added the apex CNAME record `@ → thedave.pages.dev`. Its custom-domain dashboard reports **Active** and **SSL enabled**. The existing GitHub Pages deployment remains available.

This project uses Direct Upload. Editing or pushing the GitHub repository does not update Cloudflare automatically. To publish a revision, open the [Cloudflare project](https://dash.cloudflare.com/4c2d05bf1d83798f011eccf1b03731b4/pages/view/thedave), choose **Create deployment**, and upload a ZIP whose root contains the public files from `docs/`. Confirm that `index.html` is at the ZIP root. Wrangler can also deploy future revisions after authentication; no persistent deployment credential was created during this setup.

The site is static and has no build step or backend service. Its demo uses scripted data and actions. The checked-in MP4 is included at `/dave-demo.mp4`.

The 14 September update presents the tested Mac alpha workflow: connect a selected ChatGPT conversation in Chrome, review a task proposal through CopilotKit with Featherless, and approve creation in Ambiguous. The original interactive demo is labeled as scripted. The landing page links to the public Mac alpha release and setup instructions. Autonomous task execution and native ChatGPT Mac conversation reading remain future work. The demo includes the latest click hints at `https://thedave.app/demo.html`.

Cloudflare confirmed the production Direct Upload deployment succeeded. HTTP checks on the custom domain verified the landing HTML, both updated stylesheets, the concept demo HTML, and Dave mascot against the local public files, excluding Cloudflare’s injected browser-check script. Local HTML asset references and JavaScript syntax checks passed.
