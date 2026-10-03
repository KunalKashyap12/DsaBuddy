import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../shared/types';
import { Avatar } from './Avatar';
import { FormattedMessage } from './FormattedMessage';

interface MessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  streamingText?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isGenerating, streamingText }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isGenerating]);

  return (
    <div
      style={{
        flex: 1,
        padding: '16px 18px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        background: 'transparent'
      }}
    >
      {/* If empty, show introductory greeting matching screenshot style */}
      {messages.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header with Avatar & Title matching the screenshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar size={30} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#f4f4f5',
                letterSpacing: '0.02em'
              }}
            >
              Buddy
            </span>
          </div>

          {/* Formatted body */}
          <div style={{ paddingLeft: '40px' }}>
            <FormattedMessage
              content={
                "Of course! Let's work through the problem step-by-step.\n\n" +
                "Problem Analysis:\n" +
                "I am here to guide your algorithm and intuition without spoiling the solution. Ask any question or select a prompt below to begin."
              }
            />
          </div>
        </div>
      )}

      {/* Render all messages */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user';

        if (isUser) {
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px'
              }}
            >
              <div
                style={{
                  background: '#27272a',
                  color: '#f4f4f5',
                  padding: '9px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: '1px solid #3f3f46',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        }

        // Assistant message (matching the screenshot)
        return (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxWidth: '100%'
            }}
          >
            {/* Header: Avatar + USER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar size={30} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#f4f4f5',
                  letterSpacing: '0.02em'
                }}
              >
                Buddy
              </span>
            </div>

            {/* Content body formatted with headers, blue highlight tags, code */}
            <div style={{ paddingLeft: '40px' }}>
              <FormattedMessage content={msg.content} />
            </div>
          </div>
        );
      })}

      {/* Generating / Streaming message */}
      {isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar size={30} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#f4f4f5',
                letterSpacing: '0.02em'
              }}
            >
              Buddy
            </span>
          </div>

          <div style={{ paddingLeft: '40px' }}>
            {streamingText ? (
              <FormattedMessage content={streamingText} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0', color: '#94a3b8', fontSize: '13px' }}>
                <span className="dot-pulse" style={{ display: 'inline-flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', animation: 'socraticBounce 1.4s infinite ease-in-out both' }} />
                  <span style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', animation: 'socraticBounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
                  <span style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', animation: 'socraticBounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
                </span>
                <span style={{ marginLeft: '4px', fontStyle: 'italic' }}>Thinking step-by-step...</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
