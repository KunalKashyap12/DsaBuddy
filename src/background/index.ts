import { PORT_NAME } from '../shared/constants';
import { LLMClient, APIError } from './llmClient';
import { StreamMonitor } from './guardrails/streamMonitor';
import { GuardrailPipeline } from './guardrails/pipeline';
import { StorageWrapper } from './storage';
import { PromptBuilder } from './promptBuilder';
import { ErrorCode } from '../shared/types';

const activeControllers = new Map<string, AbortController>();

// Confirmed-active Groq production models as of September 2026
const GROQ_ACTIVE_MODELS = ['qwen/qwen3.8-27b', 'deepseek-r1-distill-llama-70b', 'deepseek-r1-distill-qwen-32b'];
// All deprecated Groq model names that should be replaced
const GROQ_DEPRECATED = [
  'llama-3.1-8b-instant', 'llama3-8b-8192', 'llama3-70b-8192',
  'llama-3.3-70b-versatile', '8b-instant', '8b-8192',
  'qwen-2.5-coder-32b', 'gemma2-9b-it', 'gemma2'
];

function autoDetectProvider(apiKey: string, currentBaseUrl?: string, currentModel?: string): { baseUrl: string; model: string } {
  const key = (apiKey || '').trim();

  if (key.startsWith('gsk_')) {
    // Pick the current model if it is a known active Groq model, else fall back to first active
    const isDeprecated = !currentModel || GROQ_DEPRECATED.some(d => (currentModel || '').includes(d)) || (currentModel || '').includes('gpt');
    const model = isDeprecated ? GROQ_ACTIVE_MODELS[0] : (currentModel || GROQ_ACTIVE_MODELS[0]);
    return { baseUrl: 'https://api.groq.com/openai/v1', model };
  }

  if (key.startsWith('sk-or-v1-')) {
    return {
      baseUrl: 'https://openrouter.ai/api/v1',
      model: currentModel && currentModel.includes('/') ? currentModel : 'meta-llama/llama-3.1-8b-instruct:free'
    };
  }

  if (key.startsWith('sk-')) {
    return {
      baseUrl: 'https://api.openai.com/v1',
      model: currentModel && currentModel.includes('gpt') ? currentModel : 'gpt-4o-mini'
    };
  }

  // Fallback: use stored settings but sanitize deprecated Groq if groq URL
  const baseUrl = currentBaseUrl || 'https://api.openai.com/v1';
  let model = currentModel || 'gpt-4o-mini';
  if (baseUrl.includes('groq.com')) {
    const isDeprecated = GROQ_DEPRECATED.some(d => model.includes(d));
    if (isDeprecated) model = GROQ_ACTIVE_MODELS[0];
  }
  return { baseUrl, model };
}

// Enable session storage access across extension contexts (trusted and content scripts)
if (typeof chrome !== 'undefined' && chrome.storage?.session?.setAccessLevel) {
  chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
  }).catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('DsaBuddy Service Worker Installed.');
  if (typeof chrome !== 'undefined' && chrome.storage?.session?.setAccessLevel) {
    chrome.storage.session.setAccessLevel({
      accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
    }).catch(() => {});
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== PORT_NAME) return;

  port.onMessage.addListener(async (msg) => {
    if (msg.type === 'VALIDATE_KEY') {
      const settings = await StorageWrapper.getSettings();
      const detected = autoDetectProvider(msg.apiKey || settings.apiKey, msg.baseUrl || settings.baseUrl, settings.model);
      const res = await LLMClient.validateApiKey(msg.apiKey, detected.baseUrl);
      port.postMessage({
        type: 'KEY_VALIDATED',
        valid: res.valid,
        error: res.error
      });
      return;
    }

    if (msg.type === 'CHAT_SEND') {
      const { requestId, problem, history, userMessage, hintLevel, userCode } = msg;

      const controller = new AbortController();
      activeControllers.set(requestId, controller);

      try {
        const settings = await StorageWrapper.getSettings();

        // 1. Contest Mode Safety Check
        if (settings.contestMode && problem.isContest) {
          port.postMessage({
            type: 'CHAT_ERROR',
            requestId,
            code: 'CONTEST_DISABLED',
            message: 'Contest Mode is enabled. Socratic Coach is disabled on live contest pages to prevent academic dishonesty.'
          });
          return;
        }

        // 2. API Key Check
        if (!settings.apiKey || !settings.apiKey.trim()) {
          port.postMessage({
            type: 'CHAT_ERROR',
            requestId,
            code: 'NO_KEY',
            message: 'API Key is missing. Configure your API key in extension settings.'
          });
          return;
        }

        // Auto detect provider & model matching the API key
        const detected = autoDetectProvider(settings.apiKey, settings.baseUrl, settings.model);

        const systemPrompt = PromptBuilder.buildSystemPrompt(
          hintLevel,
          problem,
          settings.shareUserCode ? userCode : undefined,
          settings.showTagsToCoach,
          settings.language
        );

        const turnMessages = PromptBuilder.buildTurnMessages(systemPrompt, history, userMessage);
        let streamViolated = false;

        let fullText = await LLMClient.chatCompletion({
          apiKey: settings.apiKey,
          model: detected.model,
          baseUrl: detected.baseUrl,
          messages: turnMessages,
          signal: controller.signal,
          onChunk: (accumulated) => {
            if (StreamMonitor.checkStreamChunk(accumulated)) {
              streamViolated = true;
              controller.abort();
              return false;
            }

            port.postMessage({
              type: 'CHAT_DELTA',
              requestId,
              text: accumulated
            });
            return true;
          }
        });

        // Silent Regeneration Retry if stream was violated
        if (streamViolated) {
          const retryController = new AbortController();
          activeControllers.set(requestId, retryController);

          const retryTurnMessages = [
            ...turnMessages,
            {
              role: 'system',
              content: 'CRITICAL WARNING: Your previous output contained code or syntax. Answer again using ONLY words and a guiding question. DO NOT output any code or pseudocode.'
            }
          ];

          let retryViolated = false;
          fullText = await LLMClient.chatCompletion({
            apiKey: settings.apiKey,
            model: detected.model,
            baseUrl: detected.baseUrl,
            messages: retryTurnMessages,
            signal: retryController.signal,
            onChunk: (accumulated) => {
              if (StreamMonitor.checkStreamChunk(accumulated)) {
                retryViolated = true;
                retryController.abort();
                return false;
              }

              port.postMessage({
                type: 'CHAT_DELTA',
                requestId,
                text: accumulated
              });
              return true;
            }
          }).catch(() => '');

          if (retryViolated || !fullText) {
            port.postMessage({
              type: 'CHAT_REPLACE',
              requestId,
              text: '> 🛑 **[Socratic Guardrail Intercepted Response]**\n> *Solution code was detected and blocked. What core concept or observation would you like to explore next?*'
            });
            return;
          }
        }

        // Final Guardrail Pipeline Pass (never pass apiKey to judge - avoids extra API calls blocking responses)
        const processed = await GuardrailPipeline.processResponse(
          fullText,
          undefined,
          detected.model
        );

        if (processed.violated || streamViolated) {
          port.postMessage({
            type: 'CHAT_REPLACE',
            requestId,
            text: processed.safeText
          });
        }

        port.postMessage({
          type: 'CHAT_DONE',
          requestId
        });
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        let code: ErrorCode = 'UNKNOWN';
        if (err instanceof APIError) {
          code = err.code;
        }

        port.postMessage({
          type: 'CHAT_ERROR',
          requestId,
          code,
          message: err.message || 'An error occurred during communication.'
        });
      } finally {
        activeControllers.delete(requestId);
      }
    } else if (msg.type === 'CHAT_ABORT') {
      const { requestId } = msg;
      const controller = activeControllers.get(requestId);
      if (controller) {
        controller.abort();
        activeControllers.delete(requestId);
        port.postMessage({
          type: 'CHAT_DONE',
          requestId
        });
      }
    }
  });

  port.onDisconnect.addListener(() => {
    activeControllers.forEach((controller) => controller.abort());
    activeControllers.clear();
  });
});
