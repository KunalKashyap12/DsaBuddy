import { ProblemAdapter } from './adapters/types';
import { LeetCodeAdapter } from './adapters/leetcode';
import { CodeforcesAdapter } from './adapters/codeforces';

export const SiteDetector = {
  getAdapter(): ProblemAdapter | null {
    const url = new URL(window.location.href);
    if (LeetCodeAdapter.matches(url)) return LeetCodeAdapter;
    if (CodeforcesAdapter.matches(url)) return CodeforcesAdapter;
    return null;
  }
};
