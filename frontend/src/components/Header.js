import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-button" onClick={toggleSidebar}>
            <span className="menu-icon">☰</span>
          </button>
          <Link to="/" className="logo">
            <h1>Fed Economic Tracker</h1>
          </Link>
        </div>
        <div className="header-right">
          <nav className="main-nav">
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/interest-rates">Interest Rates</Link></li>
              <li><Link to="/inflation">Inflation</Link></li>
              <li><Link to="/unemployment">Unemployment</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;