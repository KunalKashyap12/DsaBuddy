import React from 'react';
import { cleanMathNotation } from '../../shared/formatMath';

interface FormattedMessageProps {
  content: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  // Clean raw LaTeX, Codeforces delimiters, and HTML entities
  const cleanedContent = cleanMathNotation(content);

  // Split into paragraphs / blocks
  const lines = cleanedContent.split('\n');

  // Helper to format inline markdown (bold, code, highlighted example tags)
  const formatInline = (text: string) => {
    // 1. Highlight example callouts (like "For instance, in Example 1:" or "Example 1:")
    const exampleRegex = /(For instance, in Example \d+:|Example \d+:)/g;
    
    // We break into segments
    const parts = text.split(exampleRegex);
    return parts.map((part, index) => {
      if (part.match(exampleRegex)) {
        return (
          <span
            key={index}
            style={{
              backgroundColor: '#18181b',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontWeight: 600,
              fontSize: '12px',
              display: 'inline-block',
              margin: '3px 0'
            }}
          >
            {part}
          </span>
        );
      }

      // Format bold (**...**) and inline code (`...` or [2 -> 4 -> 3])
      const tokens = part.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d+(?:\s*->\s*\d+)*\])/g);

      return (
        <span key={index}>
          {tokens.map((token, tIdx) => {
            if (token.startsWith('**') && token.endsWith('**')) {
              return (
                <strong key={tIdx} style={{ color: '#ffffff', fontWeight: 600 }}>
                  {token.slice(2, -2)}
                </strong>
              );
            }
            if (token.startsWith('`') && token.endsWith('`')) {
              return (
                <code
                  key={tIdx}
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#f4f4f5',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {token.slice(1, -1)}
                </code>
              );
            }
            if (token.startsWith('[') && token.endsWith(']') && token.includes('->')) {
              return (
                <span
                  key={tIdx}
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {token}
                </span>
              );
            }
            return token;
          })}
        </span>
      );
    });
  };

  return (
    <div style={{ fontSize: '13.5px', lineHeight: '1.65', color: '#d4d4d8', letterSpacing: '0.01em' }}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} style={{ height: '8px' }} />;
        }

        // Section headings like "Problem Analysis:", "Approach:", "Constraints:", etc.
        const isHeading = /^(Problem Analysis:|Approach:|Algorithm:|Complexity:|Base Cases:|Edge Cases:|Intuition:|Key Question:)/i.test(trimmed);

        if (isHeading) {
          return (
            <div
              key={lineIdx}
              style={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13.5px',
                marginTop: lineIdx === 0 ? '0' : '10px',
                marginBottom: '4px',
                letterSpacing: '0.01em'
              }}
            >
              {trimmed}
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIdx} style={{ display: 'flex', gap: '8px', marginLeft: '6px', marginBottom: '4px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6' }}>•</span>
              <div style={{ flex: 1 }}>{formatInline(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} style={{ display: 'flex', gap: '8px', marginLeft: '6px', marginBottom: '4px' }}>
              <span style={{ color: '#a1a1aa', fontWeight: 600, fontSize: '12.5px', lineHeight: '1.65' }}>{numMatch[1]}.</span>
              <div style={{ flex: 1 }}>{formatInline(numMatch[2])}</div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={lineIdx} style={{ margin: '0 0 6px 0' }}>
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
};
