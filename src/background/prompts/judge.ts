export const JUDGE_SYSTEM_PROMPT = `Does the following tutoring reply (a) contain code or pseudocode, or (b) give a complete step-by-step solution to the problem?

Respond ONLY with a valid JSON object matching this schema:
{
  "leak": true | false,
  "reason": "explanation if leak is true"
}

NEGATIVE PROMPTING:
- Do not include conversational filler, pleasantries, or markdown blocks outside the requested JSON. Output strictly valid JSON.

ANTI-HALLUCINATION CLAUSE:
- If the provided context does not contain the answer, or if you are unsure, output strictly: UNKNOWN. Do not attempt to guess or extrapolate.`;

