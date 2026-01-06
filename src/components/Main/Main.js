import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import Upload from '../Upload/Upload';
import { getUser } from '../../useAPI';
import './Main.css';

function Main() {
  const [hasApiKey, setHasApiKey] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkApiConfig = async () => {
      const result = await getUser();
      if (result.success) {
        const apiKey = result.ai_config?.api_key;
        setHasApiKey(apiKey && apiKey.trim() !== '');
      }
      setLoading(false);
    };
    checkApiConfig();
  }, []);

  return (
    <>
      <NavBar />
      {!loading && !hasApiKey && (
        <div className="api-setup-banner">
          <span className="banner-icon">⚠️</span>
          <p>You haven't configured your AI API key yet.</p>
          <button onClick={() => navigate('/profile')}>Set up in Profile →</button>
        </div>
      )}
      {!loading && (
        <div className="main-content">
          <Upload disabled={!hasApiKey} />
        </div>
      )}
    </>
  );
}

export default Main;
