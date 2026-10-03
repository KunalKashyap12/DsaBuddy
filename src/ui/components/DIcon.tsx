import React from 'react';

interface DIconProps {
  size?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const DIcon: React.FC<DIconProps> = ({ size = 22, borderRadius, style }) => {
  const radius = borderRadius ?? Math.max(3, Math.round(size * 0.22));
  const iconUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('icons/icon48.png')
    : undefined;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        background: '#0a0a0c',
        borderRadius: `${radius}px`,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
        flexShrink: 0,
        ...style
      }}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt="D"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span
          style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: `${Math.round(size * 0.62)}px`,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: 1,
            userSelect: 'none'
          }}
        >
          D
        </span>
      )}
    </div>
  );
};
