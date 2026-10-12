import React, { useState, useEffect } from 'react';
import './Profile.css';
import NavBar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import { getUser, updateUser } from '../../useAPI';

const AI_PROVIDERS = [
  { value: 'Groq', label: 'Groq (free tier)', enabled: true, placeholder: 'gsk_…', keyUrl: 'https://console.groq.com/keys', keySite: 'Groq console (free)' },
  { value: 'OpenAI', label: 'OpenAI (paid)', enabled: true, placeholder: 'sk-proj-…', keyUrl: 'https://platform.openai.com/api-keys', keySite: 'OpenAI platform' },
  { value: 'Anthropic', label: 'Anthropic', enabled: false },
  { value: 'Google', label: 'Google Gemini', enabled: false },
  { value: 'Mistral', label: 'Mistral', enabled: false },
];

function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [aiProvider, setAiProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const result = await getUser();
      if (result.success) {
        setUsername(result.username);
        setEmail(result.email || '');
        // Accounts saved before providers existed are OpenAI.
        setAiProvider(result.ai_config?.ai_provider || (result.ai_config?.api_key ? 'OpenAI' : 'Groq'));
        setApiKey(result.ai_config?.api_key || '');
      } else {
        setLoadError(result.error || 'Your settings couldn’t be loaded.');
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const provider = AI_PROVIDERS.find((p) => p.value === aiProvider);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const result = await updateUser({
      ai_config: {
        ai_provider: aiProvider,
        api_key: apiKey
      }
    });

    if (result.success) {
      setMessage('Settings saved.');
    } else {
      setError(result.error || 'Your settings couldn’t be saved. Try again.');
    }
    setSaving(false);
  };

  return (
    <div className="page">
      <NavBar />
      <main className="page-main narrow">
        <div className="page-head">
          <h1 className="page-title">Settings</h1>
        </div>

        {loading ? (
          <div className="status" role="status"><span className="spinner" />Loading your settings</div>
        ) : loadError ? (
          <p className="notice notice-error" role="alert">
            {loadError}
            <button type="button" className="btn btn-secondary btn-small notice-action" onClick={() => window.location.reload()}>Reload</button>
          </p>
        ) : (
          <>
            <section className="settings-account" aria-label="Account">
              <span className="avatar" aria-hidden="true">{username.charAt(0).toUpperCase()}</span>
              <div className="settings-account-info">
                <span className="settings-username">{username}</span>
                {email && <span className="settings-email">{email}</span>}
              </div>
            </section>

            <form className="panel settings-card" onSubmit={handleSave}>
              <h2>AI provider</h2>
              <p className="settings-desc">
                Audio is transcribed on our server for free. Writing the minutes uses your own API key:
                Groq has a free tier, OpenAI bills your account. The key is encrypted before it’s stored.
              </p>

              <div className="field">
                <label className="field-label" htmlFor="aiProvider">Provider</label>
                <select
                  id="aiProvider"
                  className="input"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                >
                  {AI_PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value} disabled={!provider.enabled}>
                      {provider.label}{!provider.enabled ? ' (coming soon)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="apiKey">{aiProvider} API key</label>
                <div className="key-input">
                  <input
                    className="input"
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    autoComplete="off"
                    spellCheck="false"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider?.placeholder}
                    aria-describedby="apiKey-hint"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApiKey(!showApiKey)}
                    aria-pressed={showApiKey}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                {provider?.keyUrl && (
                  <span id="apiKey-hint" className="field-hint">
                    No key yet? <a href={provider.keyUrl} target="_blank" rel="noopener noreferrer">Create one on the {provider.keySite}</a>.
                  </span>
                )}
              </div>

              <div aria-live="polite">
                {message && <p className="notice notice-success settings-notice">{message}</p>}
                {error && <p className="notice notice-error settings-notice">{error}</p>}
              </div>

              <div className="settings-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <span className="spinner" aria-hidden="true" />}
                  {saving ? 'Saving' : 'Save settings'}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
