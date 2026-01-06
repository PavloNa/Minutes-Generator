import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import NavBar from '../NavBar/NavBar';
import { getUser, updateUser } from '../../useAPI';

function Profile() {
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const result = await getUser();
      if (result.success) {
        setUsername(result.username);
        setApiKey(result.openai_api_key || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const result = await updateUser(apiKey);
    
    if (result.success) {
      setMessage('Settings saved successfully!');
    } else {
      setError(result.error || 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="profile-container">
          <div className="loading-spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-box">
          <div className="profile-header">
            <div className="profile-avatar">
              {username ? username.charAt(0) : 'U'}
            </div>
            <div className="profile-header-info">
              <h2>{username}</h2>
              <p>Manage your account settings and API configuration</p>
            </div>
          </div>
          
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleSave}>
            <div className="form-section">
              <h3>API Configuration</h3>
              <p className="section-description">
                Enter your OpenAI API key to enable AI-powered meeting minutes generation.
                Your key is stored securely and never shared.
              </p>
              
              <div className="form-group">
                <label htmlFor="apiKey">OpenAI API Key</label>
                <div className="api-key-input">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="api-help">
                  Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get one from OpenAI →</a>
                </p>
              </div>
            </div>

            <div className="profile-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Profile;
