import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import { getDateRange } from '../../utils/dateUtils';
import { formatPercentage, formatNumber } from '../../utils/formatUtils';

const Unemployment = () => {
  const [searchParams] = useSearchParams();
  const defaultSeries = searchParams.get('series') || 'UNRATE';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesData, setSeriesData] = useState({});
  const [changeData, setChangeData] = useState(null);
  const [timeRange, setTimeRange] = useState('5y');
  const [selectedSeries, setSelectedSeries] = useState(defaultSeries);
  
  // Labor market indicators options
  const indicators = [
    { id: 'UNRATE', name: 'Unemployment Rate' },
    { id: 'PAYEMS', name: 'Total Nonfarm Payrolls' },
    { id: 'ICSA', name: 'Initial Jobless Claims' },
    { id: 'LNS11300000', name: 'Labor Force Participation Rate' },
    { id: 'LNS12032194', name: 'Long-term Unemployed (27+ weeks)' }
  ];
  
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        
        const { startDate, endDate } = getDateRange(timeRange);
        
        const response = await api.getIndicator(selectedSeries, startDate, endDate);
        setSeriesData(response.data);
        
        // Calculate month-over-month change for certain indicators
        if (selectedSeries === 'PAYEMS' && response.data.data && response.data.data.length > 0) {
          const rawData = [...response.data.data];
          const changes = [];
          
          for (let i = 1; i < rawData.length; i++) {
            const currentValue = parseFloat(rawData[i].value);
            const previousValue = parseFloat(rawData[i - 1].value);
            
            if (!isNaN(currentValue) && !isNaN(previousValue)) {
              const change = currentValue - previousValue;
              
              changes.push({
                date: rawData[i].date,
                value: change
              });
            }
          }
          
          setChangeData({
            title: 'Monthly Change in Nonfarm Payrolls',
            data: changes
          });
        } else {
          setChangeData(null);
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
    if (selectedSeries === 'UNRATE' || selectedSeries === 'LNS11300000') {
      return formatPercentage(value);
    } else if (selectedSeries === 'PAYEMS') {
      return formatNumber(value, 0) + ' thousand';
    } else {
      return formatNumber(value, 0);
    }
  };
  
  // Helper to get tooltip formatter
  const getTooltipFormatter = () => {
    if (selectedSeries === 'UNRATE' || selectedSeries === 'LNS11300000') {
      return (value) => `${value.toFixed(1)}%`;
    } else if (selectedSeries === 'PAYEMS') {
      return (value) => `${value.toLocaleString()} thousand`;
    } else {
      return (value) => value.toLocaleString();
    }
  };
  
  return (
    <div className="unemployment indicator-page">
      <h2>Labor Market</h2>
      
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
        <div className="loading">Loading labor market data...</div>
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
                color="#ff7f0e" // Orange for unemployment
                title={seriesData.title}
                tooltipFormatter={getTooltipFormatter()}
              />
            ) : (
              <p>No data available for the selected time period.</p>
            )}
          </div>
          
          {changeData && (
            <div className="chart-container">
              <h3>{changeData.title}</h3>
              <BarChart 
                data={changeData.data} 
                xKey="date"
                yKey="value"
                title={changeData.title}
                tooltipFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toLocaleString()} jobs`}
              />
            </div>
          )}
          
          <div className="indicator-description">
            <h4>About this indicator</h4>
            <p>
              {selectedSeries === 'UNRATE' && 'The unemployment rate represents the number of unemployed people as a percentage of the labor force. The labor force is made up of the employed and the unemployed. Unemployed people are those who are jobless, actively seeking work, and available to take a job.'}
              {selectedSeries === 'PAYEMS' && 'Total Nonfarm Payrolls measures the number of U.S. workers in the economy, excluding proprietors, private household employees, unpaid volunteers, farm employees, and the unincorporated self-employed. This measure accounts for approximately 80 percent of the workers who contribute to GDP.'}
              {selectedSeries === 'ICSA' && 'Initial Jobless Claims measures the number of individuals who filed for unemployment insurance for the first time. This is an important leading indicator for the labor market and the economy as a whole.'}
              {selectedSeries === 'LNS11300000' && 'The labor force participation rate is the percentage of the civilian noninstitutional population that is in the labor force. The participation rate is an important metric for understanding employment conditions, as a declining rate may indicate discouraged workers leaving the labor force.'}
              {selectedSeries === 'LNS12032194' && 'Long-term unemployed measures the number of people who have been jobless for 27 weeks or longer. Long-term unemployment can lead to an erosion of skills, reduced earnings, and other negative outcomes.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Unemployment;