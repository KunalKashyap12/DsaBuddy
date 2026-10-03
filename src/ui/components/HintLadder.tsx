import React from 'react';
import { HintLevel } from '../../shared/types';

interface HintLadderProps {
  currentLevel: HintLevel;
  onLevelChange: (level: HintLevel) => void;
}

const HINT_LABELS: Record<HintLevel, { num: string; label: string }> = {
  1: { num: '1', label: 'Clarify' },
  2: { num: '2', label: 'Nudge' },
  3: { num: '3', label: 'Hint' },
  4: { num: '4', label: 'Pattern' },
  5: { num: '5', label: 'Review' }
};

export const HintLadder: React.FC<HintLadderProps> = ({ currentLevel, onLevelChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 14px',
        background: 'rgba(24, 24, 27, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#71717a',
          marginRight: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Hints:
      </span>
      <div
        style={{
          display: 'flex',
          gap: '4px',
          flex: 1,
          background: '#09090b',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {([1, 2, 3, 4, 5] as HintLevel[]).map((level) => {
          const isActive = currentLevel === level;
          const { num, label } = HINT_LABELS[level];

          return (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              style={{
                flex: 1,
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#ffffff' : '#a1a1aa',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 2px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px'
              }}
              title={`Level ${num}: ${label}`}
            >
              <span>{num}.</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
