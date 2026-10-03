import { SYSTEM_SOCRATIC_BASE } from './prompts/system';
import { HINT_LEVEL_PROMPTS } from './prompts/hintLevels';
import { ProblemContext, ChatMessage, HintLevel } from '../shared/types';

export const PromptBuilder = {
  buildSystemPrompt(
    hintLevel: HintLevel = 1,
    problem?: ProblemContext,
    userCode?: string,
    showTags: boolean = false,
    language: string = 'en'
  ): string {
    let prompt = SYSTEM_SOCRATIC_BASE;

    if (HINT_LEVEL_PROMPTS[hintLevel]) {
      prompt += `\n\n${HINT_LEVEL_PROMPTS[hintLevel]}`;
    }

    if (language && language !== 'en') {
      prompt += `\n\nLANGUAGE INSTRUCTION: Please respond in language code: ${language}.`;
    }

    if (problem) {
      const truncatedStatement = problem.statementText.length > 2000 
        ? problem.statementText.slice(0, 2000) + '\n...[Statement truncated for context length]'
        : problem.statementText;

      prompt += `\n\n<problem_statement>
Platform: ${problem.site}
Title: ${problem.title}
Difficulty: ${problem.difficulty || 'N/A'}
Constraints: ${problem.constraints || 'Not explicitly stated'}
Description:
${truncatedStatement}`;

      if (problem.examples && problem.examples.length > 0) {
        prompt += `\n\nExamples:\n${problem.examples.join('\n\n')}`;
      }

      prompt += `\n</problem_statement>`;

      if (userCode) {
        prompt += `\n\n<user_code_draft>\n${userCode}\n</user_code_draft>`;
      }
    }

    return prompt;
  },

  buildTurnMessages(systemPrompt: string, history: ChatMessage[], newUserMessage: string): { role: string; content: string }[] {
    const recentHistory = history.slice(-10);

    return [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: newUserMessage }
    ];
  }
};
