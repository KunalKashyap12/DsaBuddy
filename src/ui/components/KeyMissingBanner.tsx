import React from 'react';

export const KeyMissingBanner: React.FC = () => {
  const handleClick = () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        chrome.runtime.openOptionsPage();
      }
    } catch (e) {}
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: '8px',
        padding: '10px 14px',
        margin: '8px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'background 0.2s'
      }}
    >
      <div style={{ color: '#f87171', fontWeight: 700, fontSize: '12px', marginBottom: '3px' }}>
        ⚠️ API Key Missing!
      </div>
      <div style={{ color: '#fca5a5', fontSize: '11px', lineHeight: 1.4 }}>
        Click here or open Extension Settings to enter your API key.
        <br />
        <strong>Get a FREE Groq key at console.groq.com/keys</strong>
      </div>
    </div>
  );
};
