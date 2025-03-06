import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {currentYear} Federal Reserve &amp; Economic Statistical Tracker</p>
        <p className="disclaimer">
          Data source: Federal Reserve Economic Data (FRED) - Federal Reserve Bank of St. Louis
        </p>
      </div>
    </footer>
  );
};

export default Footer;