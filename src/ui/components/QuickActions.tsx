import React from 'react';
import { HintLevel } from '../../shared/types';

interface QuickActionsProps {
  hintLevel: HintLevel;
  onSelectPrompt: (promptText: string) => void;
}

const ACTION_PRESETS: Record<HintLevel, string[]> = {
  1: [
    "Trace a small example",
    "What edge cases to consider?",
    "Clarify constraints"
  ],
  2: [
    "Subtle nudge on sorting",
    "What invariant holds?",
    "Bottleneck in naive approach?"
  ],
  3: [
    "What data structure fits?",
    "Can we prune duplicate states?",
    "How does two pointers shift?"
  ],
  4: [
    "Is this DP, Greedy, or Two Pointers?",
    "Monotonic Stack pattern?",
    "Can we Binary Search the answer?"
  ],
  5: [
    "Check my thinking",
    "Will O(N log N) pass constraints?",
    "Is off-by-one boundary safe?"
  ]
};

export const QuickActions: React.FC<QuickActionsProps> = ({ hintLevel, onSelectPrompt }) => {
  const chips = ACTION_PRESETS[hintLevel] || ACTION_PRESETS[1];

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        padding: '6px 14px',
        overflowX: 'auto',
        background: 'transparent',
        scrollbarWidth: 'none'
      }}
    >
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(chip)}
          style={{
            background: 'rgba(39, 39, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#d4d4d8',
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '9999px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3f3f46';
            e.currentTarget.style.borderColor = '#60a5fa';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(39, 39, 42, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#d4d4d8';
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
};
