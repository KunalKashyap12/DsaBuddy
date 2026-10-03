import { ErrorCode } from '../shared/types';

export interface ChatMessagePayload {
  role: string;
  content: string;
}

export interface StreamParams {
  apiKey: string;
  model: string;
  baseUrl?: string;
  messages: ChatMessagePayload[];
  signal?: AbortSignal;
  onChunk?: (fullText: string, delta: string) => boolean | void;
}

export class APIError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// Confirmed-active Groq production models as of September 2026
const GROQ_CANDIDATE_MODELS = ['qwen/qwen3.8-27b', 'deepseek-r1-distill-llama-70b', 'deepseek-r1-distill-qwen-32b'];
const GROQ_DEPRECATED_NAMES = [
  'llama-3.1-8b-instant', 'llama3-8b-8192', 'llama3-70b-8192',
  'llama-3.3-70b-versatile', '8b-8192', '8b-instant',
  'qwen-2.5-coder-32b', 'gemma2-9b-it', 'gemma2'
];

function resolveActiveModel(model: string, baseUrl: string): string {
  if (baseUrl.includes('groq.com')) {
    const m = (model || '').toLowerCase();
    const isDeprecated = !m || GROQ_DEPRECATED_NAMES.some(d => m.includes(d));
    if (isDeprecated) return GROQ_CANDIDATE_MODELS[0];
    return model;
  }
  return model || (baseUrl.includes('groq.com') ? GROQ_CANDIDATE_MODELS[0] : 'gpt-4o-mini');
}

export const LLMClient = {
  async validateApiKey(apiKey: string, baseUrl = 'https://api.openai.com/v1'): Promise<{ valid: boolean; error?: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { valid: false, error: 'API Key is empty.' };
    }

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const modelsUrl = `${cleanBase}/models`;

    try {
      const res = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`
        }
      });

      if (res.ok) {
        return { valid: true };
      } else if (res.status === 401) {
        return { valid: false, error: 'Invalid API key credentials.' };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { valid: false, error: errJson.error?.message || `HTTP ${res.status}` };
      }
    } catch (e: any) {
      return { valid: false, error: e.message || 'Network connection failed.' };
    }
  },

  async chatCompletion({ apiKey, model, baseUrl = 'https://api.openai.com/v1', messages, signal, onChunk }: StreamParams): Promise<string> {
    if (!apiKey || !apiKey.trim()) {
      throw new APIError('NO_KEY', 'API Key is missing. Please configure it in extension options.');
    }

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const apiUrl = `${cleanBase}/chat/completions`;
    const activeModel = resolveActiveModel(model, cleanBase);

    const payload = {
      model: activeModel,
      messages,
      temperature: 0.3,
      max_tokens: 400,
      stream: Boolean(onChunk)
    };

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload),
        signal
      });
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      throw new APIError('NETWORK', 'Network connection error while contacting API endpoint.');
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const msg = errorJson.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      // Automatic fallback through candidate models if Groq returns model error
      if (cleanBase.includes('groq.com') && (msg.includes('decommissioned') || msg.includes('does not exist') || msg.includes('not supported'))) {
        const currentIndex = GROQ_CANDIDATE_MODELS.indexOf(activeModel);
        const nextModel = GROQ_CANDIDATE_MODELS[currentIndex + 1];
        if (nextModel) {
          return this.chatCompletion({
            apiKey,
            model: nextModel,
            baseUrl,
            messages,
            signal,
            onChunk
          });
        }
      }

      if (response.status === 401) {
        throw new APIError('INVALID_KEY', 'Invalid API Key. Please verify your key in settings.');
      } else if (response.status === 429) {
        throw new APIError('RATE_LIMIT', 'API rate limit or quota exceeded. Please check your account usage.');
      } else {
        throw new APIError('UNKNOWN', `API error: ${msg}`);
      }
    }

    if (!onChunk) {
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }

    const reader = response.body?.getReader();
    if (!reader) throw new APIError('UNKNOWN', 'ReadableStream not supported by browser environment.');

    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.substring(6));
            const delta = parsed.choices[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              const keepGoing = onChunk(fullText, delta);
              if (keepGoing === false) {
                reader.cancel('Guardrail Intercepted Stream');
                return fullText;
              }
            }
          } catch (e) {
            // Ignore partial SSE JSON chunks
          }
        }
      }
    }

    return fullText;
  }
};
