import { JUDGE_SYSTEM_PROMPT } from '../prompts/judge';
import { LLMClient } from '../llmClient';

export const GuardrailJudge = {
  async evaluateWithLLM(apiKey: string, model: string, candidateResponse: string): Promise<{ violated: boolean; reason: string }> {
    try {
      const judgeResponse = await LLMClient.chatCompletion({
        apiKey,
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: JUDGE_SYSTEM_PROMPT },
          { role: 'user', content: `EVALUATE THIS RESPONSE:\n${candidateResponse}` }
        ]
      });

      const raw = judgeResponse.trim();
      if (raw === 'UNKNOWN') {
        return { violated: false, reason: 'Judge unsure or context missing (UNKNOWN)' };
      }

      // Strip markdown code fences if model accidentally emitted them
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      const isLeak = Boolean(parsed.leak || parsed.violated);
      return {
        violated: isLeak,
        reason: parsed.reason || (isLeak ? 'LLM Judge flagged code/algorithm leak' : '')
      };
    } catch (e) {
      return { violated: false, reason: '' };
    }
  }
};
