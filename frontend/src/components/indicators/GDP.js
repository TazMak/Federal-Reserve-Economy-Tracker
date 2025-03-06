import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import { getDateRange } from '../../utils/dateUtils';
import { formatCurrency, formatPercentage } from '../../utils/formatUtils';

const GDP = () => {
  const [searchParams] = useSearchParams();
  const defaultSeries = searchParams.get('series') || 'GDPC1';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesData, setSeriesData] = useState({});
  const [growthData, setGrowthData] = useState(null);
  const [timeRange, setTimeRange] = useState('10y');
  const [selectedSeries, setSelectedSeries] = useState(defaultSeries);
  
  // GDP indicators options
  const indicators = [
    { id: 'GDPC1', name: 'Real Gross Domestic Product' },
    { id: 'A191RL1Q225SBEA', name: 'Real GDP per Capita' },
    { id: 'GDP', name: 'Nominal Gross Domestic Product' },
    { id: 'A191RI1Q225SBEA', name: 'Real GDP Percent Change' }
  ];
  
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        
        const { startDate, endDate } = getDateRange(timeRange);
        
        const response = await api.getIndicator(selectedSeries, startDate, endDate);
        setSeriesData(response.data);
        
        // Calculate quarter-over-quarter percent change for GDPC1
        if (selectedSeries === 'GDPC1' && response.data.data && response.data.data.length > 0) {
          // Skip this if we're already showing the percent change series
          const rawData = [...response.data.data];
          const changes = [];
          
          for (let i = 1; i < rawData.length; i++) {
            const currentValue = parseFloat(rawData[i].value);
            const previousValue = parseFloat(rawData[i - 1].value);
            
            if (!isNaN(currentValue) && !isNaN(previousValue) && previousValue !== 0) {
              const pctChange = ((currentValue - previousValue) / previousValue) * 100;
              
              changes.push({
                date: rawData[i].date,
                value: pctChange
              });
            }
          }
          
          setGrowthData({
            title: 'Real GDP Quarterly Growth Rate',
            data: changes
          });
        } else {
          setGrowthData(null);
        }
        
      } catch (err) {
        console.error(`Error fetching ${selectedSeries} data:`, err);
        setError(`Failed to load ${selectedSeries} data. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeriesData();
  }, [selectedSeries, timeRange]);
  
  const handleSeriesChange = (event) => {
    setSelectedSeries(event.target.value);
  };
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // Helper to format values based on the selected series
  const formatValue = (value) => {
    if (selectedSeries === 'A191RI1Q225SBEA') {
      return formatPercentage(value);
    } else if (selectedSeries === 'GDPC1' || selectedSeries === 'GDP') {
      return formatCurrency(value, 'USD', 0) + ' billion';
    } else if (selectedSeries === 'A191RL1Q225SBEA') {
      return formatCurrency(value, 'USD', 0);
    } else {
      return value.toLocaleString();
    }
  };
  
  // Helper to get tooltip formatter
  const getTooltipFormatter = () => {
    if (selectedSeries === 'A191RI1Q225SBEA') {
      return (value) => `${value.toFixed(1)}%`;
    } else if (selectedSeries === 'GDPC1' || selectedSeries === 'GDP') {
      return (value) => `$${value.toLocaleString()} billion`;
    } else if (selectedSeries === 'A191RL1Q225SBEA') {
      return (value) => `$${value.toLocaleString()}`;
    } else {
      return (value) => value.toLocaleString();
    }
  };
  
  return (
    <div className="gdp indicator-page">
      <h2>Economic Growth</h2>
      
      <div className="controls">
        <div className="selector">
          <label htmlFor="series-select">Select Indicator: </label>
          <select 
            id="series-select" 
            value={selectedSeries} 
            onChange={handleSeriesChange}
          >
            {indicators.map(indicator => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="time-controls">
          <span>Time Range: </span>
          <div className="time-buttons">
            <button 
              className={timeRange === '5y' ? 'active' : ''} 
              onClick={() => handleTimeRangeChange('5y')}
            >
              5 Years
            </button>
            <button 
              className={timeRange === '10y' ? 'active' : ''} 
              onClick={() => handleTimeRangeChange('10y')}
            >
              10 Years
            </button>
            <button 
              className={timeRange === '20y' ? 'active' : ''} 
              onClick={() => handleTimeRangeChange('20y')}
            >
              20 Years
            </button>
            <button 
              className={timeRange === 'all' ? 'active' : ''} 
              onClick={() => handleTimeRangeChange('all')}
            >
              All
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading GDP data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="indicator-content">
          <div className="indicator-header">
            <h3>{seriesData.title}</h3>
            {seriesData.data && seriesData.data.length > 0 && (
              <div className="current-value">
                <p>Latest Value: 
                  <span className="value">
                    {formatValue(seriesData.data[seriesData.data.length - 1].value)}
                  </span>
                </p>
              </div>
            )}
          </div>
          
          <div className="chart-container">
            {seriesData.data && seriesData.data.length > 0 ? (
              <LineChart 
                data={seriesData.data} 
                xKey="date"
                yKey="value"
                color="#2ca02c" // Green for GDP
                title={seriesData.title}
                tooltipFormatter={getTooltipFormatter()}
              />
            ) : (
              <p>No data available for the selected time period.</p>
            )}
          </div>
          
          {growthData && (
            <div className="chart-container">
              <h3>{growthData.title}</h3>
              <BarChart 
                data={growthData.data} 
                xKey="date"
                yKey="value"
                title={growthData.title}
                tooltipFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
              />
            </div>
          )}
          
          <div className="indicator-description">
            <h4>About this indicator</h4>
            <p>
              {selectedSeries === 'GDPC1' && 'Real Gross Domestic Product (GDP) is the inflation-adjusted value of all goods and services produced by labor and property located in the United States. It is the most comprehensive measure of U.S. economic activity and is considered the most reliable indicator of the economy\'s health.'}
              {selectedSeries === 'A191RL1Q225SBEA' && 'Real GDP per Capita is the inflation-adjusted value of GDP divided by the population. It measures the average economic output per person and is often used as an indicator of a country\'s standard of living.'}
              {selectedSeries === 'GDP' && 'Nominal Gross Domestic Product is the value of all goods and services produced by labor and property located in the United States, measured at current prices. Unlike real GDP, it does not account for inflation.'}
              {selectedSeries === 'A191RI1Q225SBEA' && 'Real GDP Percent Change measures the rate of change in Real GDP from one period to the next, adjusted for inflation. It is the most commonly cited measure of economic growth.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDP;