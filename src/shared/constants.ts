import { UserSettings } from './types';

export const STORAGE_KEYS = {
  SETTINGS: 'dsa_coach_settings',
  CHATS: 'dsa_coach_chats',
  CHAT_PREFIX: 'dsa_coach_chat_',
  SESSION_API_KEY: 'dsa_coach_session_key'
};

export const DEFAULT_SETTINGS: UserSettings = {
  apiKey: '',
  useSessionStorage: true,
  model: 'qwen/qwen3.8-27b',
  baseUrl: 'https://api.groq.com/openai/v1',
  language: 'en',
  defaultHintLevel: 1,
  contestMode: false,
  shareUserCode: false,
  showTagsToCoach: false,
  strictGuardrail: false
};

export const PORT_NAME = 'dsa_coach_chat_port';
