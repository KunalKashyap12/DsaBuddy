import React from 'react';
import { DIcon } from './DIcon';

interface AskAIButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const AskAIButton: React.FC<AskAIButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      id="ask-ai-trigger-btn"
      title={isOpen ? "Minimize DsaBuddy" : "Open DsaBuddy Chat"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#ffffff',
        color: '#111827',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        padding: '7px 15px',
        borderRadius: '9999px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: 1,
        boxShadow: isOpen
          ? '0 2px 10px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(59, 130, 246, 0.5)'
          : '0 4px 14px rgba(0, 0, 0, 0.18)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1.5px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.22)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isOpen
          ? '0 2px 10px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(59, 130, 246, 0.5)'
          : '0 4px 14px rgba(0, 0, 0, 0.18)';
      }}
    >
      <DIcon size={18} borderRadius={4} />
      <span>{isOpen ? 'Close' : 'Ask Buddy'}</span>
    </button>
  );
};
