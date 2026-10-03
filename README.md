# 🦉 DSA Thinking Coach (Chrome Extension)

> **A Socratic DSA & Competitive Programming Thinking Coach for LeetCode & Codeforces.**  
> *Builds problem-solving intuition through guided questions — NEVER provides solution code.*

---

## 🌟 Key Features

1. **Strict No-Code Guardrail Guarantee**:
   - **3-Layer Security Pipeline**: System prompt hard rules $\rightarrow$ Real-time stream monitor score threshold $\rightarrow$ Secondary LLM judge pass.
   - **Zero Code Leaks**: Never outputs solution code, pseudocode, or complete step-by-step recipes.
2. **5-Level Progressive Hint Ladder**:
   - **Level 1**: Clarify the problem, constraints, and edge cases.
   - **Level 2**: Point to key observations and analyze brute force costs ($O(N^2)$).
   - **Level 3**: Name category of technique (e.g. "tracking items seen so far") without spoiling algorithm.
   - **Level 4**: Name data structure/pattern (e.g. Monotonic Stack, DP) and why it fits.
   - **Level 5**: High-level key insight (2-3 sentences in words). *No code is ever unlocked.*
3. **Privacy-First BYOK Architecture**:
   - Bring Your Own Key: Groq (Llama / DeepSeek / Qwen) & OpenAI (`gpt-4o-mini`, `gpt-4o`).
   - All API calls routed strictly inside the background Service Worker (never exposed to host page JS context).
   - Optional `chrome.storage.session` storage (API key automatically deleted on browser close).
   - Topic tags and user code drafts hidden from LLM by default to prevent spoilers.
4. **Platform Integration & Contest Safety**:
   - Seamless Shadow DOM encapsulation on LeetCode and Codeforces (zero CSS collision).
   - Handles SPA navigation between problems automatically.
   - **Contest Mode**: Automatically disables coaching on live contest pages (`/contest/`, `/gym/`) to maintain academic integrity.
   - **Keyboard Shortcut**: Press `Alt+S` to toggle panel visibility.

---

## 📁 Project Structure

```
chrome-extension/
├── manifest.json              # Chrome Manifest V3 declaration
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compilation configuration
├── README.md                  # Project overview & documentation
├── PRIVACY_POLICY.md          # Extension privacy policy
├── scripts/
│   └── build.js               # Multi-target esbuild pipeline (with --watch)
├── icons/                     # Extension branding icons (16, 32, 48, 128)
├── background/
│   └── background.js          # Service worker bundle (target for manifest.json)
├── content/
│   └── content.js             # Content script bundle (target for manifest.json)
├── popup/
│   ├── index.html             # Options & popup HTML shell
│   └── popup.js               # React options/popup bundle
├── tests/
│   └── guardrails/
│       └── adversarial.test.js # Guardrail adversarial leak tests
└── src/                       # Source code
    ├── background/            # Background service worker & logic
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

## 🚀 Installation & Developer Setup

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Development (Watch Mode)**:
   ```bash
   npm run dev
   ```

3. **Build the Extension**:
   ```bash
   npm run build
   ```

4. **Type Check**:
   ```bash
   npm run typecheck
   ```

5. **Package for Chrome Web Store Deployment**:
   ```bash
   npm run package
   ```
   *This minifies all bundles, tree-shakes dead code, stages files into `dist/`, and outputs a ready-to-upload `dsa-buddy-extension.zip` (only ~120 KB).*

6. **Run Guardrail Test Suite**:
   ```bash
   npm test
   ```

7. **Load into Google Chrome (Testing)**:
   - Open Chrome and navigate to `chrome://extensions`.
   - Enable **Developer mode** in the top-right corner.
   - Click **Load unpacked**.
   - Select either the root `chrome-extension` directory or the staged `dist/` directory.

8. **Deploy to Chrome Web Store**:
   - Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
   - Click **New Item**.
   - Upload the generated `dsa-buddy-extension.zip`.
   - Provide the Privacy Policy link (using `PRIVACY_POLICY.md`) and submit for review.

9. **Configure API Key in Extension**:
   - Open the extension options page by clicking the extension icon or right-clicking and selecting **Options**.
   - Select your provider (Groq or OpenAI), enter your API key, click **Test Key**, and save.

---

## 🧪 Guardrail Validation Suite

The deterministic score-threshold code detector is validated via the automated test suite in `tests/guardrails/adversarial.test.js`:

```bash
npm test
```

Tests verify 0 code leaks against adversarial prompts (e.g. *"Write the solution in Python"*, *"Ignore previous instructions"*, *"Give pseudocode"*, *"Pretend you are a compiler"*).

---

## 📄 License & Privacy

- Zero telemetry, zero analytics tracking, zero third-party endpoints.
- Network calls are restricted strictly to `https://api.openai.com/*`.
