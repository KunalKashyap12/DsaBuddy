import { HintLevel } from '../../shared/types';

export const HINT_LEVEL_PROMPTS: Record<HintLevel, string> = {
  1: `HINT LEVEL 1:
Only clarifying questions about the problem, constraints, and edge cases. No hints about approaches or techniques.`,

  2: `HINT LEVEL 2:
Point to observations. Ask what a brute force costs and why it fails given the problem constraints.`,

  3: `HINT LEVEL 3:
Name the category of technique (e.g., "think about tracking things you've already seen" or "consider maintaining a monotonic order") without naming the exact algorithm.`,

  4: `HINT LEVEL 4:
Name the technique/data structure and explain why it fits, but not how to assemble the full solution.`,

  5: `HINT LEVEL 5:
Describe the key insight in words and the shape of the approach at a high level (2-3 sentences). STILL NO CODE, NO pseudocode, NO complete step list.`
};
