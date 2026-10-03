/**
 * Formats LaTeX mathematical formulas, raw Codeforces notations,
 * and HTML entities into clean, readable Unicode text for the chat interface.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&le;': '≤',
  '&ge;': '≥',
  '&ne;': '≠',
  '&times;': '×',
  '&divide;': '÷',
  '&minus;': '−',
  '&plusmn;': '±',
  '&hellip;': '…',
  '&rarr;': '→',
  '&larr;': '←',
  '&harr;': '↔',
  '&leftrightarrow;': '↔',
  '&infin;': '∞',
  '&sum;': '∑',
  '&prod;': '∏',
  '&radic;': '√',
  '&sub;': '⊂',
  '&sube;': '⊆',
  '&isin;': '∈',
  '&notin;': '∉',
  '&cap;': '∩',
  '&cup;': '∪'
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'k': 'ᵏ', 'm': 'ᵐ'
};

const GREEK_MAP: Record<string, string> = {
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
  '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\iota': 'ι', '\\kappa': 'κ',
  '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π',
  '\\rho': 'ρ', '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
  '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ', '\\Xi': 'Ξ',
  '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω'
};

function decodeHtmlEntities(str: string): string {
  return str.replace(/&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (match) => {
    if (HTML_ENTITY_MAP[match]) return HTML_ENTITY_MAP[match];
    if (match.startsWith('&#x') || match.startsWith('&#X')) {
      const code = parseInt(match.slice(3, -1), 16);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    }
    if (match.startsWith('&#')) {
      const code = parseInt(match.slice(2, -1), 10);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    }
    return match;
  });
}

function toSuperscript(str: string): string {
  return str.split('').map((ch) => SUPERSCRIPT_MAP[ch] || ch).join('');
}

export function cleanMathNotation(raw: string): string {
  if (!raw) return '';

  // 1. Preserve fenced code blocks and inline code from mutation
  const codeBlocks: string[] = [];
  let text = raw.replace(/(```[\s\S]*?```|`[^`]+`)/g, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(match);
    return placeholder;
  });

  // 2. Decode HTML entities
  text = decodeHtmlEntities(text);

  // 3. Normalize Codeforces $$$ and LaTeX delimiters
  text = text.replace(/\$\$\$([^\$]+)\$\$\$/g, '$1');
  text = text.replace(/\$\$([^\$]+)\$\$/g, '$1');
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$1');

  // Strip LaTeX environments
  text = text.replace(/\\begin\{[^{}]+\}/g, '').replace(/\\end\{[^{}]+\}/g, '');

  // Binomial: \binom{n}{k} -> C(n, k)
  text = text.replace(/\\binom\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, 'C($1, $2)');

  // Fractions: \frac{a}{b} -> (a / b)
  text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1 / $2)');

  // Square roots: \sqrt{x} -> √(x)
  text = text.replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)');
  text = text.replace(/\\sqrt\b/g, '√');

  // Summation and products
  text = text.replace(/\\sum\s*_\s*\{([^{}]+)\}\s*\^\s*\{([^{}]+)\}/g, '∑($1 to $2)');
  text = text.replace(/\\sum\s*_\s*\{([^{}]+)\}/g, '∑($1)');
  text = text.replace(/\\sum\b/g, '∑');

  text = text.replace(/\\prod\s*_\s*\{([^{}]+)\}\s*\^\s*\{([^{}]+)\}/g, '∏($1 to $2)');
  text = text.replace(/\\prod\s*_\s*\{([^{}]+)\}/g, '∏($1)');
  text = text.replace(/\\prod\b/g, '∏');

  // Greek letters
  for (const [cmd, sym] of Object.entries(GREEK_MAP)) {
    text = text.replace(new RegExp(`${cmd.replace('\\', '\\\\')}\\b`, 'g'), sym);
  }

  // Common math symbols
  text = text.replace(/\\times\b/g, '×');
  text = text.replace(/\\cdot\b|\\bullet\b/g, '·');
  text = text.replace(/\\dots\b|\\cdots\b|\\ldots\b|\\ddots\b|\\vdots\b/g, '…');
  text = text.replace(/\\leftrightarrow\b|\\longleftrightarrow\b|\\iff\b/g, '↔');
  text = text.replace(/\\rightarrow\b|\\longrightarrow\b|\\to\b|\\implies\b/g, '→');
  text = text.replace(/\\leftarrow\b|\\longleftarrow\b/g, '←');
  text = text.replace(/\\le\b|\\leq\b/g, '≤');
  text = text.replace(/\\ge\b|\\geq\b/g, '≥');
  text = text.replace(/\\neq\b|\\ne\b/g, '≠');
  text = text.replace(/\\approx\b|\\sim\b|\\simeq\b/g, '≈');
  text = text.replace(/\\pm\b/g, '±');
  text = text.replace(/\\mp\b/g, '∓');
  text = text.replace(/\\infty\b/g, '∞');
  text = text.replace(/\\oplus\b/g, '⊕');
  text = text.replace(/\\otimes\b/g, '⊗');
  text = text.replace(/\\in\b/g, '∈');
  text = text.replace(/\\notin\b/g, '∉');
  text = text.replace(/\\subset\b/g, '⊂');
  text = text.replace(/\\subseteq\b/g, '⊆');
  text = text.replace(/\\cup\b/g, '∪');
  text = text.replace(/\\cap\b/g, '∩');
  text = text.replace(/\\forall\b/g, '∀');
  text = text.replace(/\\exists\b/g, '∃');
  text = text.replace(/\\emptyset\b/g, '∅');
  text = text.replace(/\\lor\b|\\vee\b/g, '∨');
  text = text.replace(/\\land\b|\\wedge\b/g, '∧');
  text = text.replace(/\\neg\b/g, '¬');
  text = text.replace(/\\equiv\b/g, '≡');

  // Math functions without backslash
  text = text.replace(/\\(log|ln|exp|max|min|gcd|lcm|det|deg|dim)\b/g, '$1');

  // Modulo notation
  text = text.replace(/\\pmod\s*\{([^{}]+)\}/g, '(mod $1)');
  text = text.replace(/\\pmod\s+([a-zA-Z0-9]+)/g, '(mod $1)');
  text = text.replace(/\\mod\s*\{([^{}]+)\}/g, 'mod $1');
  text = text.replace(/\\mod\s+([a-zA-Z0-9]+)/g, 'mod $1');

  // Style wrappers: \text{...}, \mathcal{...}, etc.
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|mathcal|mathbb|boldsymbol)\s*\{([^{}]+)\}/g, '$1');

  // Parentheses and brackets
  text = text.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  text = text.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  text = text.replace(/\\left\\\{/g, '{').replace(/\\right\\\}/g, '}');
  text = text.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
  text = text.replace(/\\left\|/g, '|').replace(/\\right\|/g, '|');

  // Spacing commands
  text = text.replace(/\\[,;!]|\\quad\b|\\qquad\b/g, ' ');

  // Subscripts: e.g. a_{i,j} -> a[i, j], a_{i+1,j} -> a[i+1, j], a_i -> a[i]
  text = text.replace(/([a-zA-Z0-9_]+)_\{([^{}]+)\}/g, (match, prefix, index) => {
    if (['min', 'max', 'gcd', 'log'].includes(prefix)) {
      return `${prefix}(${index})`;
    }
    const cleanIndex = index.split(',').map((s: string) => s.trim()).join(', ');
    return `${prefix}[${cleanIndex}]`;
  });

  // Single-letter subscripts: e.g. a_i -> a[i], x_1 -> x[1]
  text = text.replace(/\b([a-zA-Z])_([a-zA-Z0-9])\b/g, '$1[$2]');

  // Superscripts: e.g. 10^5 -> 10⁵, 10^{9} -> 10⁹, 2^n -> 2ⁿ
  text = text.replace(/\^\{([0-9n+-]+)\}/g, (_, exp) => toSuperscript(exp));
  text = text.replace(/\^([0-9n])/g, (_, exp) => toSuperscript(exp));

  // Escaped characters: \_ -> _, \% -> %, \& -> &, \# -> #
  text = text.replace(/\\([_{}%&#$])/g, '$1');

  // Stripping remaining single dollar signs wrapping math expressions
  // e.g. $2n × 2n$ -> 2n × 2n, $i, j$ -> i, j, $1 … 2n$ -> 1 … 2n
  text = text.replace(/\$([^\$\n]+?)\$/g, '$1');

  // Clean any remaining isolated dollar signs attached to letters e.g. $n -> n
  text = text.replace(/\$([a-zA-Z0-9_]+)/g, '$1');

  // Clean multiple spaces
  text = text.replace(/[ \t]{2,}/g, ' ');

  // 4. Restore code blocks
  text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)]);

  return text;
}
