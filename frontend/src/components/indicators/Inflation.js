import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LineChart from '../charts/LineChart';
import { getDateRange } from '../../utils/dateUtils';
import { formatPercentage } from '../../utils/formatUtils';

const Inflation = () => {
  const [searchParams] = useSearchParams();
  const defaultSeries = searchParams.get('series') || 'CPIAUCSL';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesData, setSeriesData] = useState({});
  const [timeRange, setTimeRange] = useState('5y');
  const [selectedSeries, setSelectedSeries] = useState(defaultSeries);
  const [showYoY, setShowYoY] = useState(true); // Toggle for Year-over-Year change
  
  // Inflation indicators options
  const indicators = [
    { id: 'CPIAUCSL', name: 'Consumer Price Index (All Urban Consumers)' },
    { id: 'PCEPI', name: 'Personal Consumption Expenditures Price Index' },
    { id: 'CPILFESL', name: 'Core CPI (Less Food and Energy)' },
    { id: 'CORESTICKM159SFRBATL', name: 'Sticky Price CPI' }
  ];
  
  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        
        const { startDate, endDate } = getDateRange(timeRange);
        
        const response = await api.getIndicator(selectedSeries, startDate, endDate);
        
        // Process the data for year-over-year calculation if needed
        if (showYoY && response.data.data && response.data.data.length > 0) {
          const rawData = [...response.data.data];
          const yoyData = [];
          
          // Calculate YoY percentage change
          for (let i = 12; i < rawData.length; i++) {
            const currentValue = parseFloat(rawData[i].value);
            const previousValue = parseFloat(rawData[i - 12].value);
            
            if (!isNaN(currentValue) && !isNaN(previousValue) && previousValue !== 0) {
              const yoyChange = ((currentValue - previousValue) / previousValue) * 100;
              
              yoyData.push({
                date: rawData[i].date,
                value: yoyChange
              });
            }
          }
          
          const yoySeriesData = { ...response.data };
          yoySeriesData.data = yoyData;
          yoySeriesData.title = `${response.data.title} (Year-over-Year % Change)`;
          yoySeriesData.units = '%';
          
          setSeriesData(yoySeriesData);
        } else {
          setSeriesData(response.data);
        }
        
      } catch (err) {
        console.error(`Error fetching ${selectedSeries} data:`, err);
        setError(`Failed to load ${selectedSeries} data. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeriesData();
  }, [selectedSeries, timeRange, showYoY]);
  
  const handleSeriesChange = (event) => {
    setSelectedSeries(event.target.value);
  };
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  const toggleYoY = () => {
    setShowYoY(!showYoY);
  };
  
  return (
    <div className="inflation indicator-page">
      <h2>Inflation</h2>
      
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
        
        <div className="view-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={showYoY} 
              onChange={toggleYoY} 
            />
            Show Year-over-Year % Change
          </label>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading inflation data...</div>
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
                    {showYoY 
                      ? formatPercentage(seriesData.data[seriesData.data.length - 1].value) 
                      : seriesData.data[seriesData.data.length - 1].value.toFixed(1)
                    }
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
                color="#e41a1c" // Red for inflation
                title={seriesData.title}
                tooltipFormatter={(value) => showYoY ? `${value.toFixed(2)}%` : value.toFixed(2)}
              />
            ) : (
              <p>No data available for the selected time period.</p>
            )}
          </div>
          
          <div className="indicator-description">
            <h4>About this indicator</h4>
            <p>
              {selectedSeries === 'CPIAUCSL' && 'The Consumer Price Index (CPI) measures the average change in prices over time that consumers pay for a basket of goods and services. It is the most widely used measure of inflation and is sometimes viewed as an indicator of the effectiveness of government economic policy.'}
              {selectedSeries === 'PCEPI' && 'The Personal Consumption Expenditures Price Index (PCEPI) measures the prices paid by consumers for goods and services. The change in the PCEPI is known for capturing inflation (or deflation) across a wide range of consumer expenses and reflecting changes in consumer behavior.'}
              {selectedSeries === 'CPILFESL' && 'Core CPI (Less Food and Energy) measures the changes in the price of goods and services, excluding food and energy. The Federal Reserve often focuses on this measure because it tends to be less volatile than headline CPI.'}
              {selectedSeries === 'CORESTICKM159SFRBATL' && 'The Sticky Price CPI measures the prices of goods that change relatively infrequently. Because these prices are relatively inflexible, they may reflect expectations of future inflation and be useful for forecasting inflation.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inflation;