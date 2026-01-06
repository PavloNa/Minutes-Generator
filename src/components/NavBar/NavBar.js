import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../../images/logo.png';
import { getStoredToken, verifyToken, logout } from '../../useAPI';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      if (token) {
        const result = await verifyToken(token);
        if (result.success) {
          setIsLoggedIn(true);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      <a href="/" className="corner-logo">
        <img src={logo} alt="Minutes Generator" />
      </a>
      <nav className="floating-header">
        {isLoggedIn && (
          <div className="floating-nav">
            <button className="floating-text-btn" onClick={() => navigate('/files')}>Files</button>
            <button className="floating-text-btn" onClick={() => navigate('/profile')}>Profile</button>
            <button className="floating-text-btn logout" onClick={handleLogout}>Logout</button>
          </div>
        )}
        {!isLoggedIn && (
          <div className="floating-nav">
            <button className="floating-btn" onClick={() => navigate('/login')}>Login</button>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavBar;