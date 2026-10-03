import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { StorageWrapper } from '../background/storage';
import { UserSettings } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';
import { useChatPort } from '../ui/hooks/useChatPort';
import { DIcon } from '../ui/components/DIcon';

export const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [provider, setProvider] = useState<'groq' | 'openai'>('groq');
  const [status, setStatus] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; text: string } | null>(null);

  const { validateKey } = useChatPort();

  useEffect(() => {
    StorageWrapper.getSettings().then((s) => {
      setSettings(s);
      if (s.baseUrl?.includes('groq')) setProvider('groq');
      else setProvider('openai');
    });
  }, []);

  const handleProviderChange = (p: 'groq' | 'openai') => {
    setProvider(p);
    setValidationResult(null);
    if (p === 'groq') {
      setSettings((prev) => ({
        ...prev,
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'qwen/qwen3.8-27b'
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini'
      }));
    }
  };

  const handleTestKey = () => {
    if (!settings.apiKey.trim()) {
      setValidationResult({ valid: false, text: 'Please enter an API Key first.' });
      return;
    }
    setIsValidating(true);
    setValidationResult(null);

    validateKey(settings.apiKey.trim(), settings.baseUrl, (valid, error) => {
      setIsValidating(false);
      if (valid) {
        setValidationResult({ valid: true, text: '✅ API Key is valid and active!' });
      } else {
        setValidationResult({ valid: false, text: `❌ Validation Failed: ${error || 'Invalid key'}` });
      }
    });
  };

  const handleSave = async () => {
    await StorageWrapper.saveSettings({ ...settings, language: 'en' });
    setStatus('✓ Settings saved successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear ALL extension data and chat histories?')) {
      await StorageWrapper.clearAllData();
      setSettings(DEFAULT_SETTINGS);
      setStatus('All extension data cleared.');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div
      style={{
        maxWidth: '660px',
        margin: '0 auto',
        padding: '18px',
        background: '#09090b',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#f4f4f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
        <DIcon size={22} borderRadius={6} />
        <span>DsaBuddy Settings</span>
      </h1>
      <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '16px' }}>
        Configure your AI Provider, API Key, security preferences, and coaching guardrails.
      </p>

      {/* Provider Selection */}
      <div
        style={{
          background: '#121214',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px'
        }}
      >
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '8px', color: '#f4f4f5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select AI Provider
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleProviderChange('groq')}
            style={{
              flex: 1,
              padding: '9px',
              background: provider === 'groq' ? '#ffffff' : '#18181b',
              color: provider === 'groq' ? '#09090b' : '#a1a1aa',
              border: provider === 'groq' ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: provider === 'groq' ? 700 : 500,
              boxShadow: provider === 'groq' ? '0 2px 8px rgba(255, 255, 255, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Groq (100% FREE)
          </button>
          <button
            onClick={() => handleProviderChange('openai')}
            style={{
              flex: 1,
              padding: '9px',
              background: provider === 'openai' ? '#ffffff' : '#18181b',
              color: provider === 'openai' ? '#09090b' : '#a1a1aa',
              border: provider === 'openai' ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: provider === 'openai' ? 700 : 500,
              boxShadow: provider === 'openai' ? '0 2px 8px rgba(255, 255, 255, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            OpenAI (BYOK)
          </button>
        </div>

        {provider === 'groq' && (
          <div style={{ fontSize: '11px', color: '#d4d4d8', marginTop: '10px', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <strong>Groq is 100% FREE!</strong> No credit card required. Keys start with <code style={{ background: '#27272a', padding: '1px 4px', borderRadius: '3px', color: '#fff' }}>gsk_</code>. Get your free key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'underline' }}>console.groq.com/keys</a>.
          </div>
        )}
        {provider === 'openai' && (
          <div style={{ fontSize: '11px', color: '#d4d4d8', marginTop: '10px', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <strong>OpenAI (Paid/Pre-paid Account):</strong> Keys start with <code style={{ background: '#27272a', padding: '1px 4px', borderRadius: '3px', color: '#fff' }}>sk-</code>. Requires active credit balance at platform.openai.com.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* API Key */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#f4f4f5' }}>
            {provider === 'groq' ? 'Groq API Key (starts with gsk_)' : 'OpenAI API Key (starts with sk-)'}
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder={provider === 'groq' ? 'gsk_...' : 'sk-...'}
              style={{
                flex: 1,
                padding: '9px 12px',
                background: '#121214',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
            />
            <button
              onClick={handleTestKey}
              disabled={isValidating}
              style={{
                padding: '9px 14px',
                background: '#18181b',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'all 0.15s'
              }}
            >
              {isValidating ? 'Testing...' : 'Test Key'}
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '11px', cursor: 'pointer', color: '#a1a1aa' }}>
            <input
              type="checkbox"
              checked={settings.useSessionStorage}
              onChange={(e) => setSettings({ ...settings, useSessionStorage: e.target.checked })}
              style={{ accentColor: '#ffffff', cursor: 'pointer' }}
            />
            <span>Store API Key in <code>chrome.storage.session</code> (Erased on browser close)</span>
          </label>

          {validationResult && (
            <div style={{ color: validationResult.valid ? '#ffffff' : '#f87171', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
              {validationResult.text}
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#f4f4f5' }}>
            Model
          </label>
          {provider === 'groq' ? (
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 10px',
                background: '#121214',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Active - Recommended)</option>
              <option value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b (Active)</option>
              <option value="deepseek-r1-distill-qwen-32b">deepseek-r1-distill-qwen-32b (Active)</option>
            </select>
          ) : (
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 10px',
                background: '#121214',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
              <option value="gpt-4o">gpt-4o (High Intelligence)</option>
              <option value="o3-mini">o3-mini (Advanced Reasoning)</option>
            </select>
          )}
        </div>

        {/* Safety & Privacy Checkboxes */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: '#a1a1aa' }}>
            <input
              type="checkbox"
              checked={settings.contestMode}
              onChange={(e) => setSettings({ ...settings, contestMode: e.target.checked })}
              style={{ accentColor: '#ffffff', cursor: 'pointer' }}
            />
            <span><strong>Contest Mode:</strong> Disable coach on live contest pages</span>
          </label>
        </div>

        {/* Save & Clear */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px',
              background: '#ffffff',
              color: '#09090b',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 2px 10px rgba(255, 255, 255, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            Save Settings
          </button>
          <button
            onClick={handleClearAll}
            style={{
              padding: '10px 14px',
              background: '#18181b',
              color: '#a1a1aa',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'all 0.15s ease'
            }}
          >
            Clear Data
          </button>
        </div>

        {status && (
          <div
            style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

const rootEl = document.getElementById('options-root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<OptionsPage />);
}
