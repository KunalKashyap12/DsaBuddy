export type HintLevel = 1 | 2 | 3 | 4 | 5;

export interface ProblemContext {
  site: 'leetcode' | 'codeforces' | 'manual';
  id: string;
  title: string;
  difficulty?: string;
  statementText: string;
  constraints?: string;
  examples?: string[];
  isContest?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  hintLevel?: HintLevel;
  violated?: boolean;
}

export interface UserSettings {
  apiKey: string;
  useSessionStorage: boolean;
  model: string;
  baseUrl: string;
  language: string;
  defaultHintLevel: HintLevel;
  contestMode: boolean;
  shareUserCode: boolean;
  showTagsToCoach: boolean;
  strictGuardrail: boolean;
}

export type ErrorCode =
  | 'NO_KEY'
  | 'INVALID_KEY'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'GUARDRAIL_BLOCKED'
  | 'CONTEST_DISABLED'
  | 'UNKNOWN';

export interface PortMessage {
  type: 'CHAT_SEND' | 'CHAT_ABORT' | 'VALIDATE_KEY';
  requestId?: string;
  problem?: ProblemContext;
  history?: ChatMessage[];
  userMessage?: string;
  hintLevel?: HintLevel;
  userCode?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface ServerPortMessage {
  type: 'CHAT_DELTA' | 'CHAT_REPLACE' | 'CHAT_DONE' | 'CHAT_ERROR' | 'KEY_VALIDATED';
  requestId?: string;
  text?: string;
  code?: ErrorCode;
  message?: string;
  valid?: boolean;
  error?: string;
}
