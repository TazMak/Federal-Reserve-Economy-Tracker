import React, { useState, useEffect } from 'react';
import api from '../services/api';
import KeyIndicators from './KeyIndicators';
import LineChart from './charts/LineChart';
import { getDateRange } from '../utils/dateUtils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [timeRange, setTimeRange] = useState('1y');
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary data for key indicators
        const dashboardResponse = await api.getDashboardData();
        setDashboardData(dashboardResponse.data);
        
        // Fetch time series data for charts
        const { startDate, endDate } = getDateRange(timeRange);
        
        // Fetch key indicator time series
        const indicators = ['FEDFUNDS', 'UNRATE', 'CPIAUCSL', 'GDPC1'];
        const chartDataPromises = indicators.map(async (seriesId) => {
          const response = await api.getIndicator(seriesId, startDate, endDate);
          return {
            id: seriesId,
            ...response.data
          };
        });
        
        const chartResults = await Promise.all(chartDataPromises);
        
        // Organize chart data
        const chartsData = {};
        chartResults.forEach(result => {
          chartsData[result.series_id] = result;
        });
        
        setChartData(chartsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div className="dashboard">
      <h2>Economic Indicators Dashboard</h2>
      <div className="time-controls">
        <span>Time Range: </span>
        <div className="time-buttons">
          <button 
            className={timeRange === '6m' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('6m')}
          >
            6 Months
          </button>
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
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <KeyIndicators data={dashboardData} />
          
          <div className="charts-container">
            <div className="chart-row">
              <div className="chart-card">
                <h3>Federal Funds Rate</h3>
                {chartData.FEDFUNDS && (
                  <LineChart 
                    data={chartData.FEDFUNDS.data} 
                    xKey="date"
                    yKey="value"
                    color="#1f77b4"
                    tooltipFormatter={(value) => `${value}%`}
                  />
                )}
              </div>
              <div className="chart-card">
                <h3>Unemployment Rate</h3>
                {chartData.UNRATE && (
                  <LineChart 
                    data={chartData.UNRATE.data} 
                    xKey="date"
                    yKey="value"
                    color="#ff7f0e"
                    tooltipFormatter={(value) => `${value}%`}
                  />
                )}
              </div>
            </div>
            
            <div className="chart-row">
              <div className="chart-card">
                <h3>Consumer Price Index</h3>
                {chartData.CPIAUCSL && (
                  <LineChart 
                    data={chartData.CPIAUCSL.data} 
                    xKey="date"
                    yKey="value"
                    color="#2ca02c"
                  />
                )}
              </div>
              <div className="chart-card">
                <h3>Real GDP</h3>
                {chartData.GDPC1 && (
                  <LineChart 
                    data={chartData.GDPC1.data} 
                    xKey="date"
                    yKey="value"
                    color="#d62728"
                    tooltipFormatter={(value) => `$${value.toLocaleString()} Billion`}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;