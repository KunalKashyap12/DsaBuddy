import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { OptionsPage } from './Options';
import { DIcon } from '../ui/components/DIcon';

export const PopupMenu: React.FC = () => {
  const [view, setView] = useState<'menu' | 'settings'>('menu');
  const [status, setStatus] = useState('');

  const handleOpenChat = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tab?.id;
      if (tabId) {
        const isSupported = tab.url && (tab.url.includes('leetcode.com') || tab.url.includes('codeforces.'));
        if (!isSupported) {
          setStatus('Please navigate to a LeetCode or Codeforces problem page first.');
          return;
        }

        try {
          await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_CHAT_PANEL' });
          window.close();
        } catch (e) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ['content/content.js']
            });
            setTimeout(async () => {
              try {
                await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_CHAT_PANEL' });
              } catch (_) {}
              window.close();
            }, 350);
          } catch (err: any) {
            setStatus('Please refresh the LeetCode / Codeforces problem page and try again.');
          }
        }
      }
    }
  };

  const handleOpenTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/index.html') });
    }
  };

  if (view === 'settings') {
    return (
      <div style={{ width: '360px', maxHeight: '580px', overflowY: 'auto', background: '#09090b', color: '#f4f4f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ background: '#09090b', padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <button
            onClick={() => setView('menu')}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Back to Menu
          </button>
          <button
            onClick={handleOpenTab}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '11px', cursor: 'pointer' }}
            title="Open in Full Tab"
          >
            ↗ Full Tab
          </button>
        </div>
        <OptionsPage />
      </div>
    );
  }

  return (
    <div style={{ width: '320px', padding: '16px', background: '#09090b', color: '#f4f4f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
        <DIcon size={22} borderRadius={6} />
        <span style={{ color: '#ffffff' }}>DsaBuddy</span>
      </div>
      <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 16px 0' }}>
        Socratic DSA Tutor for LeetCode & Codeforces.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Option 1: Open Chat on Problem Page */}
        <button
          onClick={handleOpenChat}
          style={{
            width: '100%',
            padding: '11px 14px',
            background: '#ffffff',
            color: '#09090b',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(255, 255, 255, 0.15)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>💬</span>
          <span>Open Chat on Problem Page</span>
        </button>

        {/* Option 2: Give API Key / Settings */}
        <button
          onClick={() => setView('settings')}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#121214',
            color: '#f4f4f5',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>⚙️</span>
          <span>Configure API Key & Settings</span>
        </button>
      </div>

      {status && (
        <div style={{ fontSize: '11px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.08)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.12)', marginTop: '10px', textAlign: 'center', lineHeight: 1.4 }}>
          {status}
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#71717a', marginTop: '14px', textAlign: 'center' }}>
        Shortcut: Press <code style={{ background: '#18181b', padding: '2px 5px', borderRadius: '4px', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Alt+S</code> on problem page
      </div>
    </div>
  );
};

const rootEl = document.getElementById('options-root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<PopupMenu />);
}
