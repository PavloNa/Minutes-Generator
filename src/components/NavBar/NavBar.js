import React from 'react';
import './NavBar.css';

const NavBar = () => {
  return (

<nav className="navbar">
  <div className="navbar-left">
    <a href="/" className="logo">
      EasyMinutes
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
    <button>Upload</button>
  </div>
</nav>
);
};

export default NavBar;