import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ComposerProps {
  isGenerating: boolean;
  onSend: (text: string) => void;
  onCancel: () => void;
}

export const Composer: React.FC<ComposerProps> = ({ isGenerating, onSend, onCancel }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (isGenerating) {
      onCancel();
      return;
    }
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        padding: '10px 14px',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Pill Capsule Input Box */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#09090b',
          border: isFocused ? '1px solid #60a5fa' : '1px solid #3f3f46',
          borderRadius: '9999px',
          padding: '6px 8px 6px 16px',
          boxShadow: isFocused ? '0 0 0 3px rgba(96, 165, 250, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type your message here"
          disabled={isGenerating}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f4f4f5',
            fontSize: '13px',
            fontFamily: 'inherit',
            lineHeight: '1.4'
          }}
        />

        {/* Send / Stop Icon Button */}
        <button
          onClick={handleSubmit}
          disabled={!isGenerating && !text.trim()}
          title={isGenerating ? 'Stop generating' : 'Send message'}
          style={{
            background: isGenerating ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            border: 'none',
            color: isGenerating ? '#f87171' : (text.trim() ? '#ffffff' : '#71717a'),
            cursor: (!isGenerating && !text.trim()) ? 'default' : 'pointer',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
            outline: 'none',
            padding: 0
          }}
          onMouseEnter={(e) => {
            if (text.trim() || isGenerating) {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = isGenerating ? '#ef4444' : 'rgba(255, 255, 255, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isGenerating ? '#f87171' : (text.trim() ? '#ffffff' : '#71717a');
            e.currentTarget.style.background = isGenerating ? 'rgba(239, 68, 68, 0.2)' : 'transparent';
          }}
        >
          {isGenerating ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          ) : (
            /* Paper airplane send icon matching the screenshot */
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ transform: 'rotate(-4deg) translateX(1px)' }}
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
