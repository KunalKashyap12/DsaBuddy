# <img src="icons/icon48.png" width="30" height="30" align="center" alt="DsaBuddy" /> DsaBuddy — Socratic DSA Thinking Coach


<p align="center">
  <strong>A Socratic DSA & Competitive Programming Thinking Coach for LeetCode & Codeforces.</strong><br>
  <em>Builds problem-solving intuition through guided questions — NEVER gives solution code.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Groq-Free%20Tier%20Ready-f55036?style=flat-square" alt="Groq Free" />
  <img src="https://img.shields.io/badge/OpenAI-BYOK-green?style=flat-square&logo=openai" alt="OpenAI BYOK" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

---

## 🌟 Key Features

1. **Strict Zero-Code Guardrail Guarantee**:
   - **3-Layer Security Pipeline**: System prompt hard rules $\rightarrow$ Real-time stream monitor score threshold $\rightarrow$ Secondary LLM judge pass.
   - **Zero Code Leaks**: Never outputs solution code, syntax snippets, pseudocode, or complete step-by-step algorithms.
   - **Anti-Hallucination & Scope Boundaries**: Strictly references only the provided problem context; politely declines out-of-scope chit-chat and avoids negativity.

2. **5-Level Progressive Hint Ladder**:
   - **Level 1**: Clarify the problem, input/output specifications, constraints, and edge cases.
   - **Level 2**: Point to key problem observations and analyze brute force costs ($O(N^2)$).
   - **Level 3**: Name the category of technique (e.g., "tracking elements seen so far") without spoiling the solution.
   - **Level 4**: Suggest the algorithmic pattern or data structure (e.g., Monotonic Stack, Two Pointers, DP) and why it fits.
   - **Level 5**: High-level key intuition (2-3 sentences). *No code is ever unlocked.*

3. **100% Free & Privacy-First BYOK Architecture**:
   - **Free with Groq**: Use state-of-the-art fast models (`qwen/qwen3.8-27b`, `deepseek-r1-distill-llama-70b`) completely free with no credit card required.
   - **OpenAI Compatible**: Also supports your own OpenAI API key (`gpt-4o-mini`, `gpt-4o`).
   - **Direct & Secure**: All API calls are executed strictly within the background Service Worker (never exposed to host page JavaScript).
   - **Session Storage**: Optional ephemeral key mode that automatically clears credentials when the browser closes.

4. **Seamless Platform Integration**:
   - **LeetCode & Codeforces**: Works out of the box on problem pages and automatically watches Single Page App (SPA) navigations.
   - **Shadow DOM Encapsulation**: Isolated styles with zero CSS bleeding or interference with problem sites.
   - **Clean Mathematical Notation**: Formats mathematical equations and constraints into clean, readable Unicode math ($2n \times 2n$, $O(N \log N)$, $\le$, $10^5$) instead of raw LaTeX or HTML entities.
   - **Contest Mode**: Automatically disables the assistant on live contest pages (`/contest/`, `/gym/`) to maintain academic integrity.
   - **Keyboard Shortcut**: Press `Alt + S` anytime to toggle the coach panel.

---

## 🚀 Quickstart: Install Locally for Free

You do not need to pay anything to use DsaBuddy. You can run it locally in Chrome:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/KunalKashyap12/DsaBuddy.git
cd DsaBuddy
npm install
```

### 2. Build the Extension
```bash
npm run build
```

### 3. Load into Google Chrome
1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `DsaBuddy` project folder.

### 4. Configure Free AI Key (Groq)
1. Get a 100% free API key at [console.groq.com](https://console.groq.com) (no credit card required).
2. Click the **DsaBuddy** icon in your Chrome toolbar and select **Settings**.
3. Select **Groq**, paste your API key (`gsk_...`), click **Test Key**, and click **Save Settings**.
4. Open any problem on [LeetCode](https://leetcode.com) or [Codeforces](https://codeforces.com) — Buddy is ready to help you think!

---

## 🛠️ Developer Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts esbuild in `--watch` mode for live development |
| `npm run build` | Runs TypeScript type check and creates production-optimized bundles |
| `npm run typecheck` | Validates all TypeScript types with `tsc --noEmit` |
| `npm run package` | Builds, minifies, and creates a store-ready `dsa-buddy-extension.zip` in `dist/` |
| `npm test` | Runs the automated 10-case adversarial guardrail test suite |

---

## 📁 Project Structure

```
DsaBuddy/
├── manifest.json              # Chrome Manifest V3 declaration
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compilation configuration
├── README.md                  # Project overview & documentation
├── PRIVACY_POLICY.md          # Extension privacy policy
├── scripts/
│   ├── build.js               # Multi-target esbuild pipeline (with --watch & minification)
│   └── package.js             # Chrome Web Store packaging & zip generator
├── icons/                     # Extension branding icons (16, 32, 48, 128)
├── background/
│   └── background.js          # Production background service worker bundle
├── content/
│   └── content.js             # Production content script bundle (Shadow DOM)
├── popup/
│   ├── index.html             # Options & popup HTML shell
│   └── popup.js               # Options & settings React application bundle
├── tests/
│   └── guardrails/
│       └── adversarial.test.js # Guardrail adversarial leak tests
└── src/                       # Source code
    ├── background/            # Background service worker logic
    │   ├── guardrails/        # 3-layer guardrail inspection pipeline
    │   ├── prompts/           # Socratic system prompt & judge prompts
    │   ├── index.ts           # Background runtime & port messaging
    │   ├── llmClient.ts       # OpenAI / Groq streaming LLM client
    │   ├── promptBuilder.ts   # Context & prompt constructor
    │   └── storage.ts         # Chrome storage wrapper
    ├── content/               # Content script injected into problem pages
    │   ├── adapters/          # Site-specific problem extractors (LeetCode, Codeforces)
    │   ├── index.ts           # Content script entrypoint
    │   ├── mountShadowRoot.ts # Isolated Shadow DOM host
    │   ├── siteDetector.ts    # Problem platform detection
    │   └── spaWatcher.ts      # Single Page Application URL watcher
    ├── options/               # Extension options & popup settings React app
    │   ├── Options.tsx        # Comprehensive settings view
    │   └── PopupApp.tsx       # Popup shell & navigation
    ├── shared/                # Shared types, constants, schemas, & math formatters
    └── ui/                    # React UI components (loaded into Shadow DOM)
        ├── components/        # ChatPanel, Composer, HintLadder, MessageList, etc.
        ├── hooks/             # Chrome runtime port hook (useChatPort)
        └── App.tsx            # Main coach UI root component
```

---

## 🧪 Guardrail Validation Suite

The deterministic score-threshold code detector is validated via the automated test suite in `tests/guardrails/adversarial.test.js`:

```bash
npm test
```

Tests verify 0 code leaks against adversarial prompts (e.g. *"Write the solution in Python"*, *"Ignore previous instructions"*, *"Give pseudocode"*, *"Pretend you are a compiler"*).

---

## 🔒 Privacy & Permissions

- **Zero Telemetry**: No analytics tracking, telemetry, or external logging.
- **Direct BYOK Communication**: Network calls are strictly sent to your chosen AI provider endpoint (`https://api.groq.com/*` or `https://api.openai.com/*`).
- **Encapsulated Scope**: Only runs on LeetCode and Codeforces problem domains.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
