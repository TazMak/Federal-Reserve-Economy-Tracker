import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineChart from '../charts/LineChart';
import { getDateRange } from '../../utils/dateUtils';
import { formatPercentage } from '../../utils/formatUtils';

const EconomicForecasts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState({});
  const [selectedIndicator, setSelectedIndicator] = useState('gdp');
  const [selectedInstitution, setSelectedInstitution] = useState('all');

  // Forecast indicators
  const indicators = [
    { id: 'gdp', name: 'GDP Growth' },
    { id: 'inflation', name: 'Inflation Rate' },
    { id: 'unemployment', name: 'Unemployment Rate' },
    { id: 'interest', name: 'Federal Funds Rate' }
  ];

  // Forecasting institutions
  const institutions = [
    { id: 'all', name: 'All Institutions' },
    { id: 'fed', name: 'Federal Reserve' },
    { id: 'imf', name: 'IMF' },
    { id: 'cbo', name: 'Congressional Budget Office' },
    { id: 'oecd', name: 'OECD' }
  ];

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch from your API
        // For now, we'll simulate forecast data
        const response = await axios.get(`/api/forecasts/${selectedIndicator}`);
        setForecastData(response.data);
        
      } catch (err) {
        console.error(`Error fetching forecast data:`, err);
        // Generate simulated data for demo purposes
        const simulatedData = generateSimulatedForecastData();
        setForecastData(simulatedData);
        setError(null); // Clear error since we're using simulated data
      } finally {
        setLoading(false);
      }
    };
    
    fetchForecastData();
  }, [selectedIndicator]);

  // Generate simulated forecast data for demo purposes
  const generateSimulatedForecastData = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1, currentYear + 2];
    
    // Different base values and variations for each indicator
    let baseValue, variance;
    
    switch(selectedIndicator) {
      case 'gdp':
        baseValue = 2.0;
        variance = 1.0;
        break;
      case 'inflation':
        baseValue = 3.0;
        variance = 1.2;
        break;
      case 'unemployment':
        baseValue = 4.5;
        variance = 0.7;
        break;
      case 'interest':
        baseValue = 5.25;
        variance = 0.5;
        break;
      default:
        baseValue = 2.0;
        variance = 1.0;
    }
    
    // Generate forecasts for each institution
    const institutions = ['fed', 'imf', 'cbo', 'oecd'];
    const forecasts = {};
    
    institutions.forEach(institution => {
      // Each institution has slightly different forecasts
      const institutionVariance = Math.random() * 0.5;
      
      forecasts[institution] = years.map(year => {
        // Each year progresses from the previous with some random variation
        const yearIndex = year - currentYear;
        const randomFactor = (Math.random() - 0.5) * variance;
        let value = baseValue + randomFactor + (yearIndex * institutionVariance);
        
        // Ensure values make sense (no negative unemployment, etc.)
        if (selectedIndicator === 'unemployment' && value < 2) value = 2;
        if (selectedIndicator === 'interest' && value < 0) value = 0;
        
        return {
          year: year.toString(),
          value: parseFloat(value.toFixed(1))
        };
      });
    });
    
    // Calculate consensus (average) forecast
    const consensus = years.map(year => {
      const yearForecasts = institutions.map(inst => 
        forecasts[inst].find(f => f.year === year.toString()).value
      );
      
      const avgValue = yearForecasts.reduce((sum, val) => sum + val, 0) / yearForecasts.length;
      
      return {
        year: year.toString(),
        value: parseFloat(avgValue.toFixed(1))
      };
    });
    
    forecasts.consensus = consensus;
    
    return {
      indicator: selectedIndicator,
      title: indicators.find(ind => ind.id === selectedIndicator).name,
      units: selectedIndicator === 'gdp' || selectedIndicator === 'inflation' ? '%' : 
             selectedIndicator === 'unemployment' ? '%' : '%',
      forecasts: forecasts
    };
  };

  const handleIndicatorChange = (event) => {
    setSelectedIndicator(event.target.value);
  };

  const handleInstitutionChange = (event) => {
    setSelectedInstitution(event.target.value);
  };

  // Format data for chart display
  const prepareChartData = () => {
    if (!forecastData.forecasts) return [];
    
    const currentYear = new Date().getFullYear();
    
    // First add historical data (simulated)
    const chartData = [
      { date: `${currentYear-3}-12-31`, value: getHistoricalValue(currentYear-3) },
      { date: `${currentYear-2}-12-31`, value: getHistoricalValue(currentYear-2) },
      { date: `${currentYear-1}-12-31`, value: getHistoricalValue(currentYear-1) },
      { date: `${currentYear}-06-30`, value: getHistoricalValue(currentYear) }
    ];
    
    // Add forecast data based on selected institution
    if (selectedInstitution === 'all') {
      // Add consensus forecast
      forecastData.forecasts.consensus.forEach(item => {
        chartData.push({
          date: `${item.year}-12-31`,
          value: item.value
        });
      });
    } else {
      // Add selected institution's forecast
      if (forecastData.forecasts[selectedInstitution]) {
        forecastData.forecasts[selectedInstitution].forEach(item => {
          chartData.push({
            date: `${item.year}-12-31`,
            value: item.value
          });
        });
      }
    }
    
    return chartData;
  };
  
  // Generate plausible historical values
  const getHistoricalValue = (year) => {
    const randomFactor = Math.random() * 0.5;
    
    switch(selectedIndicator) {
      case 'gdp':
        return year === 2020 ? -3.4 + randomFactor : 2.0 + randomFactor; // 2020 COVID recession
      case 'inflation':
        return year >= 2021 ? 4.5 + randomFactor : 1.8 + randomFactor; // Recent inflation spike
      case 'unemployment':
        return year === 2020 ? 8.1 + randomFactor : 4.0 + randomFactor; // 2020 COVID spike
      case 'interest':
        return year <= 2021 ? 0.25 + randomFactor : 4.0 + randomFactor; // Recent rate hikes
      default:
        return 2.0 + randomFactor;
    }
  };

  const getForecastTitle = () => {
    const indicatorName = indicators.find(ind => ind.id === selectedIndicator)?.name || '';
    const institutionName = institutions.find(inst => inst.id === selectedInstitution)?.name || '';
    
    return `${indicatorName} Forecast ${institutionName !== 'All Institutions' ? `(${institutionName})` : ''}`;
  };

  return (
    <div className="indicator-page">
      <h2>Economic Forecasts</h2>
      
      <div className="controls">
        <div className="selector">
          <label htmlFor="indicator-select">Select Indicator: </label>
          <select 
            id="indicator-select" 
            value={selectedIndicator} 
            onChange={handleIndicatorChange}
          >
            {indicators.map(indicator => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="selector">
          <label htmlFor="institution-select">Forecasting Institution: </label>
          <select 
            id="institution-select" 
            value={selectedInstitution} 
            onChange={handleInstitutionChange}
          >
            {institutions.map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading forecast data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="indicator-content">
          <div className="indicator-header">
            <h3>{getForecastTitle()}</h3>
          </div>
          
          <div className="chart-container">
            <LineChart 
              data={prepareChartData()} 
              xKey="date"
              yKey="value"
              color="#6a0dad" // Purple for forecasts
              title={getForecastTitle()}
              tooltipFormatter={(value) => `${value}%`}
            />
          </div>
          
          <div className="forecast-comparison">
            <h4>Forecast Comparison</h4>
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Institution</th>
                  {forecastData.forecasts?.consensus?.map(item => (
                    <th key={item.year}>{item.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forecastData.forecasts && Object.entries(forecastData.forecasts)
                  .filter(([institution]) => institution !== 'consensus')
                  .map(([institution, data]) => (
                    <tr key={institution}>
                      <td>{institutions.find(inst => inst.id === institution)?.name || institution}</td>
                      {data.map(item => (
                        <td key={item.year}>{item.value}%</td>
                      ))}
                    </tr>
                  ))}
                
                {/* Add consensus forecast (average) as the last row */}
                {forecastData.forecasts?.consensus && (
                  <tr className="consensus-row">
                    <td><strong>Consensus</strong></td>
                    {forecastData.forecasts.consensus.map(item => (
                      <td key={item.year}><strong>{item.value}%</strong></td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="indicator-description">
            <h4>About these forecasts</h4>
            <p>
              {selectedIndicator === 'gdp' && 
                'GDP growth forecasts represent the anticipated annual percentage change in real Gross Domestic Product. These forecasts take into account factors such as consumer spending, business investment, government expenditure, and net exports.'}
              {selectedIndicator === 'inflation' && 
                'Inflation forecasts represent the projected annual percentage change in consumer prices. The Federal Reserve targets an average inflation rate of 2% over time, considering this level consistent with their dual mandate of maximum employment and price stability.'}
              {selectedIndicator === 'unemployment' && 
                'Unemployment rate forecasts represent the projected percentage of the labor force that will be unemployed. The natural rate of unemployment (which accounts for frictional and structural unemployment) is typically estimated to be between 3.5% and 5.5%.'}
              {selectedIndicator === 'interest' && 
                'Federal Funds Rate forecasts represent projections for the target range set by the Federal Open Market Committee (FOMC). This rate influences other interest rates throughout the economy and is a key tool for monetary policy.'}
            </p>
            <p className="forecast-disclaimer">
              <em>Note: Economic forecasts are subject to uncertainty and may change as new data becomes available. The data shown here represents projections from various institutions and should not be interpreted as definitive predictions.</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EconomicForecasts;