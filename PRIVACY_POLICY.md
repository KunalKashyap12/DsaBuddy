# Privacy Policy for DSA Thinking Coach

**Effective Date:** September 29, 2026

## Overview
DSA Thinking Coach is a Chrome extension designed to assist competitive programmers and developers on LeetCode and Codeforces. This privacy policy describes how user information is handled.

## 1. Data Collection and Usage
DSA Thinking Coach **does not collect, store, or transmit any personal identification data or telemetry** to external servers or third parties.

## 2. API Key Management (BYOK)
- Users provide their own OpenAI API key ("Bring Your Own Key").
- API keys are stored locally in the browser's `chrome.storage.local` or `chrome.storage.session` storage depending on user configuration.
- The API key is used **exclusively** to authenticate requests sent directly from the extension's background service worker to `https://api.openai.com`.
- API keys are **never** logged, exposed to the host page DOM, or transmitted to any third-party server.

## 3. Data Transmitted to OpenAI
When a user requests coaching assistance, the following information is sent directly to OpenAI's Chat Completions API:
- Problem title, description, and constraints extracted from the active problem page.
- User-submitted chat messages and prompt choices.
- User code editor draft (*only if the user explicitly opts in via settings*).

## 4. Third-Party Access
- No data is shared with advertisers, analytics vendors, or third parties.
- Network requests are strictly restricted to `https://api.openai.com/*` as configured in the extension manifest host permissions.

## 5. User Control & Data Removal
Users can clear all stored settings, API keys, and chat histories at any time by clicking **"Clear All Data"** in the extension options page.

## 6. Contact
For questions regarding this privacy policy, please open an issue in the official project repository.
