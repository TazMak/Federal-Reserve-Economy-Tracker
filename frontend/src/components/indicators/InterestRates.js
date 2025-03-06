import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LineChart from '../charts/LineChart';
import YieldCurve from '../charts/YieldCurve';
import { getDateRange } from '../../utils/dateUtils';
import { formatPercentage } from '../../utils/formatUtils';

const InterestRates = () => {
  const [searchParams] = useSearchParams();
  const defaultSeries = searchParams.get('series') || 'FEDFUNDS';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesData, setSeriesData] = useState({});
  const [timeRange, setTimeRange] = useState('5y');
  const [selectedSeries, setSelectedSeries] = useState(defaultSeries);
  const [availableSeries, setAvailableSeries] = useState([]);
  
  useEffect(() => {
    // Load the list of available interest rate indicators
    const fetchAvailableIndicators = async () => {
      try {
        const response = await api.getIndicators();
        const interestRateIndicators = response.data.indicators.filter(
          ind => ind.category === 'Interest Rates'
        );
        setAvailableSeries(interestRateIndicators);
      } catch (err) {
        console.error('Error fetching available indicators:', err);
        setError('Failed to load indicator options.');
      }
    };
    
    fetchAvailableIndicators();
  }, []);
  
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        
        const { startDate, endDate } = getDateRange(timeRange);
        
        const response = await api.getIndicator(selectedSeries, startDate, endDate);
        setSeriesData(response.data);
        
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
  
  return (
    <div className="interest-rates indicator-page">
      <h2>Interest Rates</h2>
      
      <div className="controls">
        <div className="selector">
          <label htmlFor="series-select">Select Indicator: </label>
          <select 
            id="series-select" 
            value={selectedSeries} 
            onChange={handleSeriesChange}
          >
            {availableSeries.map(series => (
              <option key={series.id} value={series.id}>
                {series.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="time-controls">
          <span>Time Range: </span>
          <div className="time-buttons">
            <button 
              className={timeRange === '1y' ? 'active' : ''} 
              onClick={() => handleTimeRangeChange('1y')}
            >
              1 Year
            </button>
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
              className={timeRange === 'all' ? 'active' : ''} 
              onClick={() => handleTimeRangeChange('all')}
            >
              All
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading interest rate data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="indicator-content">
          <div className="indicator-header">
            <h3>{seriesData.title}</h3>
            {seriesData.data && seriesData.data.length > 0 && (
              <div className="current-value">
                <p>Latest Value: 
                  <span className="value">{formatPercentage(seriesData.data[seriesData.data.length - 1].value)}</span>
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
                color="#0066cc"
                title={seriesData.title}
                tooltipFormatter={(value) => `${value}%`}
              />
            ) : (
              <p>No data available for the selected time period.</p>
            )}
          </div>
          
          <div className="indicator-description">
            <h4>About this indicator</h4>
            <p>
              {selectedSeries === 'FEDFUNDS' && 'The federal funds rate is the interest rate at which depository institutions trade federal funds with each other overnight. Changes in the federal funds rate trigger a chain of events that affect other short-term interest rates, foreign exchange rates, long-term interest rates, the amount of money and credit, and, ultimately, a range of economic variables.'}
              {selectedSeries === 'T10Y2Y' && 'The 10-Year Treasury Constant Maturity Minus 2-Year Treasury Constant Maturity yield spread is the difference between the 10-year Treasury rate and the 2-year Treasury rate. This spread is followed as an indicator of economic conditions. A negative spread (or "inverted yield curve") has historically been viewed as a predictor of recessions.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestRates;