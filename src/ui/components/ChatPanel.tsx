import React, { useState, useEffect } from 'react';
import { QuickActions } from './QuickActions';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { useChatPort } from '../hooks/useChatPort';
import { ProblemContext, ChatMessage, HintLevel, UserSettings } from '../../shared/types';
import { StorageWrapper } from '../../background/storage';
import { LeetCodeAdapter } from '../../content/adapters/leetcode';

interface ChatPanelProps {
  problem: ProblemContext | null;
  settings: UserSettings;
  onMinimize: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ problem: initialProblem, settings, onMinimize }) => {
  const [problem, setProblem] = useState<ProblemContext | null>(initialProblem);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hintLevel: HintLevel = settings.defaultHintLevel || 1;
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');

  const { isGenerating, streamingText, sendMessage, abortMessage } = useChatPort();

  const chatKey = problem ? `${problem.site}:${problem.id}` : null;

  useEffect(() => {
    setProblem(initialProblem);
  }, [initialProblem]);

  useEffect(() => {
    if (chatKey) {
      StorageWrapper.getChatHistory(chatKey).then(setMessages);
    }
  }, [chatKey]);

  const handleSend = async (userText: string) => {
    let currentProblem = problem;

    if (!currentProblem) {
      currentProblem = {
        site: 'leetcode',
        id: 'generic_dsa',
        title: 'DSA Practice',
        statementText: 'DSA problem solving and conceptual guidance.'
      };
      setProblem(currentProblem);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      hintLevel
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);

    const userCode = settings.shareUserCode ? LeetCodeAdapter.getUserCode?.() || undefined : undefined;

    sendMessage(
      currentProblem,
      updatedHistory,
      userText,
      hintLevel,
      userCode,
      async (finalText, replaced) => {
        const coachMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: finalText,
          timestamp: Date.now(),
          violated: replaced
        };
        const newHistory = [...updatedHistory, coachMsg];
        setMessages(newHistory);
        if (chatKey) {
          await StorageWrapper.saveChatHistory(chatKey, newHistory);
        }
      },
      (code, message) => {
        let errDesc = message || 'An unexpected error occurred.';
        if (code === 'NO_KEY') errDesc = '🔑 OpenAI / Groq API Key is missing. Click the extension icon in your browser toolbar to set your key.';
        if (code === 'INVALID_KEY') errDesc = '❌ Invalid API Key. Please verify your key in extension settings.';
        if (code === 'RATE_LIMIT') errDesc = '⏳ Rate limit or quota exceeded. Please wait a moment or check your account.';
        if (code === 'NETWORK') errDesc = '🌐 Network error. Check your internet connection.';
        if (code === 'CONTEST_DISABLED') errDesc = '🏆 Contest Mode Active: Coach disabled on live contest pages to preserve academic integrity.';

        const errMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Notice [${code}]:** ${errDesc}`,
          timestamp: Date.now()
        };
        setMessages([...updatedHistory, errMsg]);
      }
    );
  };

  const handleManualSave = () => {
    if (!manualTitle.trim() || !manualText.trim()) return;
    const manualProblem: ProblemContext = {
      site: 'manual',
      id: `manual_${Date.now()}`,
      title: manualTitle.trim(),
      statementText: manualText.trim()
    };
    setProblem(manualProblem);
    setShowManualInput(false);
  };

  const handleNewChat = async () => {
    setMessages([]);
    if (chatKey) {
      await StorageWrapper.clearChatHistory(chatKey);
    }
  };

  const getDifficultyColor = (diff?: string) => {
    if (!diff) return '#a1a1aa';
    const lower = diff.toLowerCase();
    if (lower.includes('easy')) return '#22c55e';
    if (lower.includes('medium')) return '#f59e0b';
    if (lower.includes('hard')) return '#ef4444';
    return '#60a5fa';
  };

  return (
    <div
      style={{
        width: '460px',
        height: '590px',
        maxHeight: 'calc(100vh - 100px)',
        maxWidth: 'calc(100vw - 32px)',
        background: 'rgba(24, 24, 27, 0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f4f4f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          background: 'rgba(20, 20, 22, 0.95)',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        {/* Left: Problem info or AI Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            {problem?.title || 'DsaBuddy'}
          </span>
          {problem?.difficulty && (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: getDifficultyColor(problem.difficulty),
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '1px 6px',
                borderRadius: '4px'
              }}
            >
              {problem.difficulty}
            </span>
          )}
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* New Chat */}
          <button
            onClick={handleNewChat}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#a1a1aa',
              borderRadius: '6px',
              fontSize: '11px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.15s'
            }}
            title="Start new conversation"
          >
            + New
          </button>

          {/* Minimize / Close */}
          <button
            onClick={onMinimize}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '4px 6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.15s'
            }}
            title="Close Assistant"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4f4f5';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#71717a';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Manual Paste Modal */}
      {showManualInput && (
        <div style={{ background: '#1c1c1f', padding: '12px 16px', borderBottom: '1px solid #2e2e32', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5' }}>Problem Statement (Manual)</div>
          <input
            type="text"
            placeholder="Problem Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            style={{ padding: '6px 10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
          />
          <textarea
            placeholder="Problem Statement & Constraints..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={3}
            style={{ padding: '6px 10px', background: '#09090b', border: '1px solid #3f3f46', borderRadius: '6px', color: '#fff', fontSize: '12px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowManualInput(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleManualSave} style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <MessageList messages={messages} isGenerating={isGenerating} streamingText={streamingText} />

      {/* Quick Actions (subtle prompt chips before conversation starts) */}
      {messages.length <= 1 && (
        <QuickActions hintLevel={hintLevel} onSelectPrompt={handleSend} />
      )}

      {/* Composer Input Bar */}
      <Composer isGenerating={isGenerating} onSend={handleSend} onCancel={abortMessage} />
    </div>
  );
};
