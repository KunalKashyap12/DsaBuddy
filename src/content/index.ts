import React from 'react';
import ReactDOM from 'react-dom/client';
import { SiteDetector } from './siteDetector';
import { mountShadowRoot } from './mountShadowRoot';
import { App } from '../ui/App';

let isMounted = false;

async function init() {
  if (isMounted) {
    const hostEl = document.getElementById('dsa-thinking-coach-host');
    if (hostEl) hostEl.style.display = 'block';
    window.dispatchEvent(new CustomEvent('dsabuddy-open-chat'));
    return;
  }

  try {
    const adapter = SiteDetector.getAdapter();
    if (!adapter) return;

    await adapter.waitUntilReady();
    const problem = adapter.getProblem();

    const shadow = mountShadowRoot();

    let container = shadow.getElementById('dsa-thinking-coach-react-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dsa-thinking-coach-react-root';
      shadow.appendChild(container);
    }

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App, { problem }));
    isMounted = true;

    adapter.onProblemChange(() => {
      try {
        const newProblem = adapter.getProblem();
        root.render(React.createElement(App, { problem: newProblem }));
      } catch (err) {
        console.error('[DsaBuddy] Problem change update error:', err);
      }
    });

    // Global Keyboard Shortcut: Alt+S to toggle panel visibility
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        const hostEl = document.getElementById('dsa-thinking-coach-host');
        if (hostEl) {
          hostEl.style.display = hostEl.style.display === 'none' ? 'block' : 'none';
        }
      }
    });
  } catch (error) {
    console.error('[DsaBuddy] Failed to initialize coach UI:', error);
  }
}

// Listen for runtime message from popup menu
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE_CHAT_PANEL') {
    if (!isMounted) {
      init().then(() => {
        window.dispatchEvent(new CustomEvent('dsabuddy-open-chat'));
      });
    } else {
      const hostEl = document.getElementById('dsa-thinking-coach-host');
      if (hostEl) {
        hostEl.style.display = 'block';
      }
      window.dispatchEvent(new CustomEvent('dsabuddy-open-chat'));
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}

// Fallback retry for dynamic or delayed pages on Codeforces
if (!isMounted) {
  let retries = 0;
  const retryInterval = setInterval(() => {
    if (isMounted || retries > 15) {
      clearInterval(retryInterval);
      return;
    }
    retries++;
    const adapter = SiteDetector.getAdapter();
    if (adapter) {
      init();
    }
  }, 400);
}
