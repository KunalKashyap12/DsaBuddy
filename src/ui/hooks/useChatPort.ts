import { useState, useRef, useCallback, useEffect } from 'react';
import { PORT_NAME } from '../../shared/constants';
import { ChatMessage, ProblemContext, HintLevel, ErrorCode, ServerPortMessage } from '../../shared/types';

function tryConnect(): chrome.runtime.Port | null {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime?.id) return null;
    return chrome.runtime.connect({ name: PORT_NAME });
  } catch (e) {
    return null;
  }
}

export function useChatPort() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);

  const connectPort = useCallback((): chrome.runtime.Port | null => {
    if (portRef.current) {
      try {
        // Verify port is still alive by checking runtime id
        if (chrome.runtime?.id) return portRef.current;
      } catch (_) {}
      portRef.current = null;
    }

    const port = tryConnect();
    if (!port) return null;

    portRef.current = port;
    port.onDisconnect.addListener(() => {
      portRef.current = null;
    });
    return port;
  }, []);

  const getPortWithRetry = useCallback(async (retries = 3): Promise<chrome.runtime.Port | null> => {
    for (let i = 0; i < retries; i++) {
      const port = connectPort();
      if (port) return port;
      // Wait before retry — service worker may be starting up
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
    return null;
  }, [connectPort]);

  const validateKey = useCallback((apiKey: string, baseUrl: string | undefined, callback: (valid: boolean, error?: string) => void) => {
    getPortWithRetry().then(port => {
      if (!port) {
        callback(false, 'Extension runtime unavailable. Please reload the extension and refresh the page.');
        return;
      }

      const listener = (msg: ServerPortMessage) => {
        if (msg.type === 'KEY_VALIDATED') {
          callback(Boolean(msg.valid), msg.error);
          port.onMessage.removeListener(listener);
        }
      };
      port.onMessage.addListener(listener);
      port.postMessage({ type: 'VALIDATE_KEY', apiKey, baseUrl });
    });
  }, [getPortWithRetry]);

  const sendMessage = useCallback((
    problem: ProblemContext,
    history: ChatMessage[],
    userMessage: string,
    hintLevel: HintLevel,
    userCode?: string,
    onComplete?: (finalText: string, replaced?: boolean) => void,
    onError?: (code: ErrorCode, message?: string) => void
  ) => {
    setIsGenerating(true);
    setStreamingText('');
    setErrorCode(null);

    const requestId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    activeRequestIdRef.current = requestId;

    getPortWithRetry().then(port => {
      if (!port) {
        const msg = 'Extension service worker unavailable. Please go to chrome://extensions, reload the extension, then refresh this page (F5).';
        onError?.('UNKNOWN', msg);
        setIsGenerating(false);
        return;
      }

      let accumulatedText = '';

      const listener = (msg: ServerPortMessage) => {
        if ('requestId' in msg && msg.requestId !== requestId) return;

        if (msg.type === 'CHAT_DELTA') {
          accumulatedText = msg.text || '';
          setStreamingText(accumulatedText);
        } else if (msg.type === 'CHAT_REPLACE') {
          accumulatedText = msg.text || '';
          setStreamingText(accumulatedText);
          onComplete?.(accumulatedText, true);
          setIsGenerating(false);
          port.onMessage.removeListener(listener);
        } else if (msg.type === 'CHAT_DONE') {
          onComplete?.(accumulatedText, false);
          setIsGenerating(false);
          port.onMessage.removeListener(listener);
        } else if (msg.type === 'CHAT_ERROR') {
          const errCode: ErrorCode = msg.code || 'UNKNOWN';
          setErrorCode(errCode);
          onError?.(errCode, msg.message);
          setIsGenerating(false);
          port.onMessage.removeListener(listener);
        }
      };

      port.onMessage.addListener(listener);
      port.postMessage({
        type: 'CHAT_SEND',
        requestId,
        problem,
        history,
        userMessage,
        hintLevel,
        userCode
      });
    });
  }, [getPortWithRetry]);

  const abortMessage = useCallback(() => {
    if (portRef.current && activeRequestIdRef.current) {
      try {
        portRef.current.postMessage({
          type: 'CHAT_ABORT',
          requestId: activeRequestIdRef.current
        });
      } catch (_) {}
    }
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    streamingText,
    errorCode,
    sendMessage,
    abortMessage,
    validateKey
  };
}
