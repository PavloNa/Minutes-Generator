import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© 2026 Pavlo Nazarchuk</p>
        <ul className="footer-links">
          <li><a href="https://github.com/PavloNa" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/pavlonazarchuk/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="mailto:pavlo.naz.work@gmail.com">Email</a></li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
