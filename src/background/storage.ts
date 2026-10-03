import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../shared/constants';
import { UserSettings, ChatMessage } from '../shared/types';

export interface StoredProblemChat {
  messages: ChatMessage[];
  summary?: string;
  updatedAt: number;
}

export const StorageWrapper = {
  async getSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage) {
          resolve(DEFAULT_SETTINGS);
          return;
        }

        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (localRes) => {
          if (chrome.runtime.lastError) {
            resolve(DEFAULT_SETTINGS);
            return;
          }
          const localSettings: UserSettings = { ...DEFAULT_SETTINGS, ...(localRes[STORAGE_KEYS.SETTINGS] || {}) };

          if (localSettings.useSessionStorage && chrome.storage.session) {
            chrome.storage.session.get([STORAGE_KEYS.SETTINGS], (sessionRes) => {
              const sessionSettings = sessionRes?.[STORAGE_KEYS.SETTINGS] || {};
              resolve({
                ...localSettings,
                apiKey: sessionSettings.apiKey || ''
              });
            });
          } else {
            resolve(localSettings);
          }
        });
      } catch (e) {
        resolve(DEFAULT_SETTINGS);
      }
    });
  },

  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage) {
          resolve();
          return;
        }

        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (res) => {
          const current = res?.[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
          const updated = { ...current, ...settings };

          if (updated.useSessionStorage && chrome.storage.session) {
            const sessionApiKey = updated.apiKey;
            const localPayload = { ...updated, apiKey: '' };
            chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: localPayload }, () => {
              chrome.storage.session.set({ [STORAGE_KEYS.SETTINGS]: { apiKey: sessionApiKey } }, () => resolve());
            });
          } else {
            chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => resolve());
          }
        });
      } catch (e) {
        resolve();
      }
    });
  },

  async getChatHistory(chatKey: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage) {
          resolve([]);
          return;
        }
        chrome.storage.local.get([STORAGE_KEYS.CHATS], (res) => {
          const chats = res?.[STORAGE_KEYS.CHATS] || {};
          const chatData: StoredProblemChat = chats[chatKey];
          resolve(chatData ? chatData.messages : []);
        });
      } catch (e) {
        resolve([]);
      }
    });
  },

  async saveChatHistory(chatKey: string, messages: ChatMessage[], summary?: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage) {
          resolve();
          return;
        }
        chrome.storage.local.get([STORAGE_KEYS.CHATS], (res) => {
          const chats: Record<string, StoredProblemChat> = res?.[STORAGE_KEYS.CHATS] || {};
          chats[chatKey] = {
            messages: messages.slice(-20),
            summary,
            updatedAt: Date.now()
          };

          const entries = Object.entries(chats);
          if (entries.length > 50) {
            entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt);
            const cappedChats = Object.fromEntries(entries.slice(0, 50));
            chrome.storage.local.set({ [STORAGE_KEYS.CHATS]: cappedChats }, () => resolve());
          } else {
            chrome.storage.local.set({ [STORAGE_KEYS.CHATS]: chats }, () => resolve());
          }
        });
      } catch (e) {
        resolve();
      }
    });
  },

  async clearChatHistory(chatKey: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage) {
          resolve();
          return;
        }
        chrome.storage.local.get([STORAGE_KEYS.CHATS], (res) => {
          const chats = res?.[STORAGE_KEYS.CHATS] || {};
          delete chats[chatKey];
          chrome.storage.local.set({ [STORAGE_KEYS.CHATS]: chats }, () => resolve());
        });
      } catch (e) {
        resolve();
      }
    });
  },

  async clearAllData(): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
          resolve();
          return;
        }
        if (chrome.storage.session) {
          chrome.storage.session.clear();
        }
        chrome.storage.local.clear(() => resolve());
      } catch (e) {
        resolve();
      }
    });
  }
};
