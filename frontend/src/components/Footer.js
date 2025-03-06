import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {currentYear} Federal Reserve &amp; Economic Indicator Tracker</p>
        <p className="disclaimer">
          Data source: Federal Reserve Economic Data (FRED) - St. Louis Fed
        </p>
      </div>
    </footer>
  );
};

export default Footer;