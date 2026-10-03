import { ProblemAdapter } from './types';
import { ProblemContext } from '../../shared/types';
import { cleanMathNotation } from '../../shared/formatMath';

export const CodeforcesAdapter: ProblemAdapter = {
  matches(url: URL): boolean {
    const hostname = url.hostname.toLowerCase();
    const isCodeforces = hostname.includes('codeforces.');
    if (!isCodeforces) return false;

    const pathname = url.pathname.toLowerCase();

    // Problem page patterns on Codeforces
    const isProblemPath = (
      pathname.includes('/problemset/problem/') ||
      pathname.includes('/problem/') ||
      pathname.includes('/acmsguru/problem/') ||
      (pathname.includes('/contest/') && pathname.includes('/problem/')) ||
      (pathname.includes('/gym/') && pathname.includes('/problem/')) ||
      (pathname.includes('/group/') && pathname.includes('/problem/'))
    );

    if (isProblemPath) return true;

    // Fallback: If DOM already has .problem-statement, it is definitely a problem page
    if (typeof document !== 'undefined' && document.querySelector('.problem-statement')) {
      return true;
    }

    return false;
  },

  async waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        const statement = document.querySelector('.problem-statement');
        if (statement || attempts >= 15) {
          resolve();
        } else {
          attempts++;
          setTimeout(check, 120);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => check(), { once: true });
      } else {
        check();
      }
    });
  },

  getProblem(): ProblemContext | null {
    try {
      const url = new URL(window.location.href);
      if (!this.matches(url)) return null;

      const isContest = url.pathname.includes('/contest/') || url.pathname.includes('/gym/');

      // Extract problem ID
      let id = url.pathname;
      let match = url.pathname.match(/\/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i);
      if (match) id = `${match[1]}/${match[2]}`;

      if (!match) {
        match = url.pathname.match(/\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);
        if (match) id = `${match[1]}/${match[2]}`;
      }

      if (!match) {
        match = url.pathname.match(/\/gym\/(\d+)\/problem\/([A-Z0-9]+)/i);
        if (match) id = `gym/${match[1]}/${match[2]}`;
      }

      if (!match) {
        match = url.pathname.match(/\/group\/[^\/]+\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);
        if (match) id = `${match[1]}/${match[2]}`;
      }

      const statement = document.querySelector('.problem-statement');
      if (!statement) {
        return {
          site: 'codeforces',
          id,
          title: document.title ? document.title.replace('- Codeforces', '').trim() : 'Codeforces Problem',
          statementText: 'Codeforces problem statement',
          isContest
        };
      }

      // Title
      const titleEl = statement.querySelector('.header .title');
      const title = titleEl ? (titleEl as HTMLElement).innerText.trim() : (document.title.replace('- Codeforces', '').trim() || 'Codeforces Problem');

      // Limits
      const timeEl = statement.querySelector('.header .time-limit');
      const timeLimit = timeEl ? (timeEl as HTMLElement).innerText.replace('time limit per test', '').trim() : '1s';

      const memEl = statement.querySelector('.header .memory-limit');
      const memoryLimit = memEl ? (memEl as HTMLElement).innerText.replace('memory limit per test', '').trim() : '256MB';

      // Statement body paragraphs - safely iterate children without relative selector syntax errors
      const bodyTexts: string[] = [];
      const children = Array.from(statement.children);
      children.forEach((child) => {
        const el = child as HTMLElement;
        if (
          !el.classList.contains('header') &&
          !el.classList.contains('sample-tests') &&
          !el.classList.contains('input-specification') &&
          !el.classList.contains('output-specification')
        ) {
          const text = el.innerText?.trim();
          if (text) bodyTexts.push(text);
        }
      });

      // Examples
      const sampleTests = statement.querySelector('.sample-tests');
      const examples: string[] = [];
      if (sampleTests) {
        examples.push((sampleTests as HTMLElement).innerText.trim());
      }

      // Input spec
      const inputSpec = statement.querySelector('.input-specification');
      const inputSpecText = inputSpec ? (inputSpec as HTMLElement).innerText.trim() : '';

      // Output spec
      const outputSpec = statement.querySelector('.output-specification');
      const outputSpecText = outputSpec ? (outputSpec as HTMLElement).innerText.trim() : '';

      let statementText = bodyTexts.join('\n\n');
      if (inputSpecText) statementText += `\n\nInput Specification:\n${inputSpecText}`;
      if (outputSpecText) statementText += `\n\nOutput Specification:\n${outputSpecText}`;

      statementText = cleanMathNotation(statementText);
      const cleanedExamples = examples.map((ex) => cleanMathNotation(ex));

      return {
        site: 'codeforces',
        id,
        title,
        difficulty: 'Codeforces',
        statementText: statementText.trim() || 'Problem statement loaded.',
        constraints: `Time Limit: ${timeLimit} | Memory Limit: ${memoryLimit}`,
        examples: cleanedExamples.length > 0 ? cleanedExamples : undefined,
        isContest
      };
    } catch (e) {
      console.error('[DsaBuddy] Error extracting Codeforces problem:', e);
      return {
        site: 'codeforces',
        id: window.location.pathname,
        title: 'Codeforces Problem',
        statementText: 'Codeforces problem statement',
        isContest: false
      };
    }
  },

  getUserCode(): string | null {
    return null;
  },

  onProblemChange(cb: () => void): () => void {
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(cb, 800);
      }
    });

    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }
};
