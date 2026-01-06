import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../../images/logo.png';
import { getStoredToken, verifyToken, logout } from '../../useAPI';

const NavBar = () => {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      if (token) {
        const result = await verifyToken(token);
        if (result.success) {
          setUsername(result.username);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUsername(null);
    navigate('/login');
  };

  return (

<nav className="navbar">
  <div className="navbar-left">
    <a href="/" className="logo">
      <img src={logo} alt="EasyMinutes" className="logo-icon" />
    </a>
  </div>
  <div className="navbar-center">
    <ul className="nav-links">
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  </div>
  <div className="navbar-right">
    {username ? (
      <>
        <span className="username-display" onClick={() => navigate('/profile')}>{username}</span>
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </>
    ) : (
      <>
        <button className="btn btn-login" onClick={() => navigate('/login')}>Login</button>
        <button className="btn btn-register" onClick={() => navigate('/login')}>Register</button>
      </>
    )}
  </div>
</nav>
);
};

export default NavBar;