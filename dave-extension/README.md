# Dave Chrome helper

This development extension connects selected saved text conversations at `https://chatgpt.com` to the Dave Mac app. Requires Chrome 120 or later and Dave 0.3.0 alpha. It is not published in the Chrome Web Store.

## Install

1. Open the new Dave app. In **Connect**, click **Install Chrome connection**.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and choose this `Dave-Chrome-helper` folder.
4. Open a saved ChatGPT conversation. Click Dave's toolbar icon, choose **Preview this conversation**, review the excerpt, and click **Connect this chat**.
5. In Dave's **Connect** view, choose **Use as my mission**, **Return to chat**, or **Save for later**.

Dave and Chrome must both be running. If you move the app, use **Repair Chrome connection**. New chats need a saved conversation URL before connecting. Reconnect after page reloads or navigation to another conversation. Closed tabs must be opened and connected again.

## Data and actions

The extension reads up to six loaded messages, capped at 12,000 characters. It excludes sidebar history, composer drafts, and controls from excerpts. It does not fetch private ChatGPT endpoints, read cookies, or load missing history. Incognito, new chats, and Temporary Chats are unsupported.

Preview stays within Chrome. Connecting sends the excerpt to Dave on this Mac through Native Messaging. Excerpts stay in memory and disappear when disconnected, paused, screen-locked, idle, or stale. Connection preferences contain tab and document references, without excerpts. Click **Disconnect this chat** in the extension to stop watching it.

**Use this chat in Ask Dave** separately permits sharing that selected excerpt with OpenAI through CopilotKit. Dave's background classifier still uses app/title/URL context. **Insert into ChatGPT** fills an empty composer; it preserves existing drafts and never presses Send. Response stopping, scheduled-task controls, and native ChatGPT conversation reading are not included.

Ambiguous task creation lives in Dave. Add your workspace API key in **Connect**, then review a task's title and description before clicking **Create in Ambiguous**. No conversation transcript is automatically sent to Ambiguous.

## Verification

The local test suite covers extraction, limits, unsupported pages, pause, navigation, draft preservation, sender identity, and the compiled native bridge. Live ChatGPT layouts and contenteditable draft insertion still need testing in Chrome; browser control was unavailable during this build. A layout change can make the reader unavailable. Reconnect or report the unsupported layout without sharing private conversation text.

Run checks from `dave-app/` with `npm run verify`.

## Remove

Remove the extension through `chrome://extensions`. To remove its native registration, delete only `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/app.thedave.chrome.json`. Dave's local missions and ideas remain available.
