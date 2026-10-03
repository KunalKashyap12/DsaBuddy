import { ProblemAdapter } from './types';
import { ProblemContext } from '../../shared/types';

export const LeetCodeAdapter: ProblemAdapter = {
  matches(url: URL): boolean {
    return url.hostname.includes('leetcode.com') && (url.pathname.includes('/problems/') || url.pathname.includes('/contest/'));
  },

  async waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        const titleEl = document.querySelector('div[data-cy="question-title"], .text-title-large, [data-track-load="description_content"], .no-select.text-title-large');
        if (titleEl || attempts > 6) {
          resolve();
        } else {
          attempts++;
          setTimeout(check, 300);
        }
      };
      check();
    });
  },

  getProblem(): ProblemContext | null {
    const url = new URL(window.location.href);
    if (!this.matches(url)) return null;

    const isContest = url.pathname.includes('/contest/');
    const match = url.pathname.match(/\/(problems|contest\/[^\/]+\/problems)\/([^\/]+)/);
    const id = match ? match[2] : (url.pathname.split('/')[2] || 'two-sum');

    let title = '';
    let difficulty = 'Medium';
    let statementText = '';
    let constraints = '';
    const examples: string[] = [];

    // Expanded selectors for modern LeetCode UI
    const titleEl = document.querySelector('div[data-cy="question-title"], .text-title-large, .no-select.text-title-large, div[class*="title"]');
    if (titleEl) {
      title = (titleEl as HTMLElement).innerText.trim();
    } else {
      title = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    const diffEl = document.querySelector('div[class*="text-difficulty-"], span[class*="text-difficulty-"], [class*="difficulty"]');
    if (diffEl) difficulty = (diffEl as HTMLElement).innerText.trim();

    const descEl = document.querySelector('div[data-track-load="description_content"], .elfjS, [class*="description"]');
    if (descEl) {
      const clone = descEl.cloneNode(true) as HTMLElement;
      
      const exampleBlocks = clone.querySelectorAll('.example, pre, [class*="example"]');
      exampleBlocks.forEach(blk => examples.push((blk as HTMLElement).innerText.trim()));

      const items = clone.querySelectorAll('ul li, ol li');
      const cList: string[] = [];
      items.forEach(it => {
        const text = (it as HTMLElement).innerText;
        if (text.includes('10^') || text.includes('<=') || text.includes('length') || text.includes('constraints')) cList.push(text.trim());
      });
      constraints = cList.join('; ');
      statementText = clone.innerText.trim();
    }

    return {
      site: 'leetcode',
      id,
      title: title || 'Two Sum',
      difficulty,
      statementText: statementText || `LeetCode Problem: ${title || id}`,
      constraints: constraints || 'See problem statement for constraints',
      examples: examples.length > 0 ? examples : undefined,
      isContest
    };
  },

  getUserCode(): string | null {
    const lines = document.querySelectorAll('.monaco-editor .view-line');
    if (lines.length > 0) {
      return Array.from(lines).map(l => (l as HTMLElement).innerText).join('\n').slice(0, 1500);
    }
    return null;
  },

  onProblemChange(cb: () => void): () => void {
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(cb, 500);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }
};
