import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { getStoredToken, verifyToken, logout } from '../../useAPI';
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from '../icons';
import Logo from '../Logo';

const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/files', label: 'Files' },
  { to: '/profile', label: 'Settings' },
  { to: '/about', label: 'About' },
];

const currentTheme = () => document.documentElement.dataset.theme || 'dark';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(currentTheme);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      const result = token ? await verifyToken(token) : { success: false };
      setIsLoggedIn(result.success);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const toggleTheme = () => {
    document.documentElement.dataset.theme = nextTheme;
    try { localStorage.setItem('theme', nextTheme); } catch (e) { /* private mode: theme just won't persist */ }
    setTheme(nextTheme);
  };

  const links = LINKS.map(({ to, label }) => (
    <NavLink key={to} to={to} end className="nav-link" onClick={() => setMenuOpen(false)}>
      {label}
    </NavLink>
  ));

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand" aria-label="Minutes Generator, go to dashboard"><Logo size={32} /></Link>

        {isLoggedIn && <nav className="nav-links" aria-label="Main">{links}</nav>}

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          {isLoggedIn && (
            <>
              <button type="button" className="btn btn-ghost btn-small nav-logout" onClick={handleLogout}>
                Log out
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-small nav-menu-btn"
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
                Menu
              </button>
            </>
          )}
          {isLoggedIn === false && (
            <Link to="/login" className="btn btn-secondary btn-small">Sign in</Link>
          )}
        </div>
      </div>

      {isLoggedIn && menuOpen && (
        <nav id="nav-menu" className="nav-menu" aria-label="Main">
          {links}
          <button type="button" className="nav-link nav-menu-logout" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
