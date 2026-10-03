import { z } from 'zod';

export const HintLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
]);

export const ProblemContextSchema = z.object({
  site: z.enum(['leetcode', 'codeforces']),
  id: z.string(),
  title: z.string(),
  statementText: z.string(),
  constraints: z.string().optional(),
  examples: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  topicTags: z.array(z.string()).optional()
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.number(),
  hintLevel: HintLevelSchema.optional(),
  violated: z.boolean().optional()
});

export const ChatSendSchema = z.object({
  type: z.literal('CHAT_SEND'),
  requestId: z.string(),
  problem: ProblemContextSchema,
  history: z.array(ChatMessageSchema),
  userMessage: z.string(),
  hintLevel: HintLevelSchema,
  userCode: z.string().optional()
});

export const ChatAbortSchema = z.object({
  type: z.literal('CHAT_ABORT'),
  requestId: z.string()
});

export const ClientPortMessageSchema = z.discriminatedUnion('type', [
  ChatSendSchema,
  ChatAbortSchema
]);

export const UserSettingsSchema = z.object({
  apiKey: z.string(),
  model: z.string().default('gpt-4o-mini'),
  defaultHintLevel: HintLevelSchema.default(1),
  shareUserCode: z.boolean().default(false),
  showTagsToCoach: z.boolean().default(false),
  strictGuardrail: z.boolean().default(true),
  language: z.string().default('en')
});
