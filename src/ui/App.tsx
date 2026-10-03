import React, { useState, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { AskAIButton } from './components/AskAIButton';
import { ProblemContext, UserSettings } from '../shared/types';
import { StorageWrapper } from '../background/storage';
import { DEFAULT_SETTINGS } from '../shared/constants';

interface AppProps {
  problem: ProblemContext | null;
}

export const App: React.FC<AppProps> = ({ problem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime?.id) return;
      StorageWrapper.getSettings().then(setSettings).catch(() => {});

      const handleStorageChange = () => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
            StorageWrapper.getSettings().then(setSettings).catch(() => {});
          }
        } catch (e) {}
      };

      if (chrome.storage?.onChanged) {
        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
          try {
            if (chrome.runtime?.id) {
              chrome.storage.onChanged.removeListener(handleStorageChange);
            }
          } catch (e) {}
        };
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('dsabuddy-open-chat', handleOpen);
    return () => window.removeEventListener('dsabuddy-open-chat', handleOpen);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        userSelect: 'text',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif'
      }}
    >
      {/* Isolated Shadow DOM Stylesheet */}
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::selection {
          background: #2563eb;
          color: #ffffff;
        }

        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-panel-container {
          animation: socraticSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom right;
        }

        @keyframes socraticSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes socraticBounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* Floating Chat Panel when active */}
      {isOpen && (
        <div className="chat-panel-container">
          <ChatPanel
            problem={problem}
            settings={settings}
            onMinimize={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Bottom Right 'Ask AI' Trigger Button (Matches the Screenshot) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <AskAIButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
      </div>
    </div>
  );
};
