/**
 * number as a percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return 'N/A';
    
    return `${Number(value).toFixed(decimals)}%`;
  };
  
  /**
   * number as currency
   * @param {number} value - Value to format
   * @param {string} currency - Currency code
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted currency
   */
  export const formatCurrency = (value, currency = 'USD', decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };
  
  /**
   * formatting a large number with commas and abbreviations
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number
   */
  export const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined) return 'N/A';
    
    if (Math.abs(value) >= 1000000000) {
      return `${(value / 1000000000).toFixed(decimals)}B`;
    }
    
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    }
    
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;
    }
    
    return value.toFixed(decimals);
  };
  
  /**
   * get appropriate formatter based on indicator type
   * @param {string} indicator - Indicator ID or type
   * @returns {Function} Formatter function
   */
  export const getFormatter = (indicator) => {
    // Percentage indicators
    const percentageIndicators = [
      'UNRATE',  // Unemployment Rate
      'FEDFUNDS', // Federal Funds Rate
      'T10Y2Y',   // 10-Year Treasury Constant Maturity Minus 2-Year
      'CPIAUCSL', // CPI (when formatted as percent change)
      'PCEPI',    // PCE Price Index (when formatted as percent change)
      'A191RI1Q225SBEA', // Real GDP percent change
    ];
    
    // Currency indicators
    const currencyIndicators = [
      'GDP',      // Gross Domestic Product
      'GDPC1',    // Real Gross Domestic Product
    ];
    
    if (percentageIndicators.includes(indicator)) {
      return (value) => formatPercentage(value);
    }
    
    if (currencyIndicators.includes(indicator)) {
      return (value) => formatCurrency(value, 'USD');
    }
    
    // Default to regular number formatting
    return (value) => formatNumber(value);
  };