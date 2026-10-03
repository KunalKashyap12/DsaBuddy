export interface DetectionResult {
  violated: boolean;
  score: number;
  reason: string;
}

export const CodeDetector = {
  // Score threshold for code leak detection
  THRESHOLD: 3,

  evaluate(text: string): DetectionResult {
    if (!text || text.trim().length === 0) {
      return { violated: false, score: 0, reason: '' };
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Triple backtick code blocks (fenced blocks are never allowed in Socratic tutoring)
    if (/```/i.test(text)) {
      score += 4;
      reasons.push('Fenced code block detected');
    }

    // 2. HTML <code> tags containing code structures
    if (/<code>[\s\S]*?<\/code>/i.test(text) && /(for|while|if|def|function|var|let|const|int|return|;)/.test(text)) {
      score += 3;
      reasons.push('Code HTML element detected');
    }

    // 3. Keyword / syntax combinations (score threshold)
    const syntaxPatterns = [
      { pattern: /\b(def|function)\s+[a-zA-Z_]\w*\s*\(/, weight: 3, name: 'Function definition' },
      { pattern: /\b(public|private|protected)\s+(static\s+)?(void|int|class|String|List|boolean)/, weight: 3, name: 'Class / method signature' },
      { pattern: /\bclass\s+Solution\b/i, weight: 3, name: 'LeetCode Solution class' },
      { pattern: /#include\s*<[a-zA-Z0-9_.]+>/, weight: 3, name: 'C++ include header' },
      { pattern: /\b(for|while)\s*\(\s*(int|let|var|auto)?\s*[a-zA-Z_]\w*\s*=/, weight: 3, name: 'Loop initialization syntax' },
      { pattern: /\bfor\s+[a-zA-Z_]\w*\s+in\s+(range|enumerate)\b/, weight: 3, name: 'Python loop syntax' },
      { pattern: /\bstd::(vector|cin|cout|endl|map|set|unordered_map)\b/, weight: 2, name: 'C++ STL usage' },
      { pattern: /\b(vector|unordered_map|unordered_set|priority_queue)\s*</, weight: 2, name: 'C++ container declaration' },
      { pattern: /\bcin\s*>>|\bcout\s*<</, weight: 2, name: 'C++ I/O streams' },
      { pattern: /\bvoid\s+solve\s*\(/, weight: 3, name: 'Competitive programming solve function' },
      { pattern: /\bios_base::sync_with_stdio\b/, weight: 3, name: 'C++ fast I/O boilerplate' },
      { pattern: /\b(System\.out\.println|console\.log|printf\(|scanf\()/, weight: 2, name: 'Print output function' },
      { pattern: /;\s*$/m, weight: 1, name: 'Semicolon terminated code statement' },
      { pattern: /=>\s*\{/, weight: 2, name: 'Arrow function expression' },
      { pattern: /\{\s*\n\s*[a-zA-Z0-9_]+\s*=\s*/, weight: 2, name: 'Block assignment' }
    ];

    for (const item of syntaxPatterns) {
      if (item.pattern.test(text)) {
        score += item.weight;
        reasons.push(item.name);
      }
    }

    // 4. Line-by-line algorithm recipe pattern
    if (/step\s*1\s*:\s*initialize.*step\s*2\s*:\s*loop/is.test(text) ||
        /1\.\s*initialize\s+a\s+(hashmap|vector|array).*2\.\s*iterate.*3\.\s*return/is.test(text)) {
      score += 4;
      reasons.push('Full step-by-step algorithm recipe');
    }

    // Check against score threshold
    const violated = score >= this.THRESHOLD;
    return {
      violated,
      score,
      reason: violated ? reasons.join('; ') : ''
    };
  },

  sanitize(text: string): string {
    return `> 🛑 **[Socratic Guardrail Triggered]**\n> *Solution code output was intercepted. DsaBuddy never provides the actual code to a problem—let's build your problem-solving intuition step-by-step instead.*\n\nWhat is the current approach or invariant you're exploring?`;
  }
};
