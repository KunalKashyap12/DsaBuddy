import { CodeDetector } from './codeDetector';
import { GuardrailJudge } from './judge';

export interface PipelineResult {
  safeText: string;
  violated: boolean;
  reason: string;
}

export const GuardrailPipeline = {
  async processResponse(text: string, apiKey?: string, model?: string): Promise<PipelineResult> {
    if (!text) {
      return { safeText: text, violated: false, reason: '' };
    }

    // 1. Deterministic Score Threshold Check
    const localCheck = CodeDetector.evaluate(text);
    if (localCheck.violated) {
      return {
        safeText: CodeDetector.sanitize(text),
        violated: true,
        reason: localCheck.reason
      };
    }

    // 2. Optional LLM Judge Check if API key is provided
    if (apiKey && text.length > 80) {
      const judgeCheck = await GuardrailJudge.evaluateWithLLM(apiKey, model || 'gpt-4o-mini', text);
      if (judgeCheck.violated) {
        return {
          safeText: CodeDetector.sanitize(text),
          violated: true,
          reason: judgeCheck.reason
        };
      }
    }

    return {
      safeText: text,
      violated: false,
      reason: ''
    };
  }
};
