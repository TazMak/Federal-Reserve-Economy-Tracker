import React from 'react';
import { formatDate } from '../utils/dateUtils';

const IndicatorCard = ({ 
  title, 
  value, 
  units = '', 
  date, 
  trend = 'neutral', 
  description = '',
  color = '#333'
}) => {
  // Handle null or undefined values
  const displayValue = value !== null && value !== undefined 
    ? parseFloat(value).toFixed(2) 
    : 'N/A';
  
  // Format the date
  const formattedDate = date ? formatDate(date) : 'N/A';
  
  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="trend up">↑</span>;
      case 'down':
        return <span className="trend down">↓</span>;
      default:
        return <span className="trend neutral">→</span>;
    }
  };
  
  return (
    <div className="indicator-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="indicator-header">
        <h3>{title}</h3>
        {getTrendIcon()}
      </div>
      
      <div className="indicator-value">
        <span style={{ color }}>{displayValue}</span>
        {units && <span className="units">{units}</span>}
      </div>
      
      <div className="indicator-date">
        As of {formattedDate}
      </div>
      
      {description && (
        <div className="indicator-description">
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default IndicatorCard;