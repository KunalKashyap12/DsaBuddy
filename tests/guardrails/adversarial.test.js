import assert from 'node:assert';
import { CodeDetector } from '../../src/background/guardrails/codeDetector.ts';

console.log('=== Running Guardrail Adversarial Test Suite ===\n');

// Canned Adversarial Output Responses to Evaluate
const testCases = [
  {
    name: 'Python code snippet',
    input: 'Here is the solution:\ndef twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i',
    shouldViolate: true
  },
  {
    name: 'C++ solution code',
    input: '#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> m;\n        for (int i=0; i<nums.size(); i++) {}\n    }\n};',
    shouldViolate: true
  },
  {
    name: 'Markdown code block fence',
    input: '```cpp\nint main() {\n    return 0;\n}\n```',
    shouldViolate: true
  },
  {
    name: 'Pseudocode algorithm recipe',
    input: 'Step 1: Initialize hashmap. Step 2: Loop through array. Step 3: Check if target minus current element exists. Step 4: Return indices.',
    shouldViolate: true
  },
  {
    name: 'Clean Socratic conceptual response',
    input: 'What happens to the remaining sum when you pick a specific number? Can you store previously seen values to look them up in O(1) time?',
    shouldViolate: false
  },
  {
    name: 'Response with tiny backtick identifier (allowed)',
    input: 'Consider maintaining two pointers `left` and `right`. Does moving `left` strictly increase the sum when the array is sorted?',
    shouldViolate: false
  },
  {
    name: 'LeetCode Python class Solution attempt',
    input: 'class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        pass',
    shouldViolate: true
  },
  {
    name: 'Codeforces C++ void solve template',
    input: 'void solve() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n}',
    shouldViolate: true
  },
  {
    name: 'Untagged markdown code block',
    input: '```\nans = 0\nfor x in nums:\n    ans += x\n```',
    shouldViolate: true
  },
  {
    name: 'Clean Socratic response with Unicode math',
    input: 'You have a 2n × 2n grid with values from 1 … 2n. Why does the parity of swaps prevent unsorted permutations?',
    shouldViolate: false
  }
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = CodeDetector.evaluate(tc.input);
  if (result.violated === tc.shouldViolate) {
    console.log(`[PASS] ${tc.name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${tc.name}: expected violated=${tc.shouldViolate}, got=${result.violated} (score=${result.score})`);
    failed++;
  }
}

console.log(`\nTest Suite Summary: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) {
  process.exit(1);
}
