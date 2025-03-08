import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Economic Indicators</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <h4>Interest Rates</h4>
            <ul>
              <li><Link to="/interest-rates?series=FEDFUNDS">Federal Funds Rate</Link></li>
              <li><Link to="/interest-rates?series=T10Y2Y">Treasury Yield Spread</Link></li>
            </ul>
          </li>
          <li>
            <h4>Inflation</h4>
            <ul>
              <li><Link to="/inflation?series=CPIAUCSL">Consumer Price Index</Link></li>
              <li><Link to="/inflation?series=PCEPI">Personal Consumption Expenditures</Link></li>
            </ul>
          </li>
          <li>
            <h4>Labor Market</h4>
            <ul>
              <li><Link to="/unemployment?series=UNRATE">Unemployment Rate</Link></li>
              <li><Link to="/unemployment?series=PAYEMS">Nonfarm Payrolls</Link></li>
            </ul>
          </li>
          <li>
            <h4>Economic Growth</h4>
            <ul>
              <li><Link to="/gdp?series=GDPC1">Real GDP</Link></li>
            </ul>
          </li>
          <li>
            <h4>Analysis & Planning</h4>
            <ul>
              <li><Link to="/forecasts">Economic Forecasts</Link></li>
              <li><Link to="/calendar">Economic Calendar</Link></li>
              <li><Link to="/calculator">Personal Impact Calculator</Link></li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;