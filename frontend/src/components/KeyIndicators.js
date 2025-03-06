import React from 'react';
import IndicatorCard from './IndicatorCard';

const KeyIndicators = ({ data }) => {
  
    if (!data || Object.keys(data).length === 0) {
    return <div className="key-indicators-loading">Loading key indicators...</div>;
  }
  
  const fedFunds = data.FEDFUNDS || {};
  const unemployment = data.UNRATE || {};
  const cpi = data.CPIAUCSL || {};
  const gdp = data.GDPC1 || {};
  
  return (
    <div className="key-indicators">
      <IndicatorCard 
        title="Federal Funds Rate"
        value={fedFunds.value}
        units="%"
        date={fedFunds.date}
        trend="neutral"
        description="The target interest rate set by the Federal Open Market Committee, used by banks to charge each other for short-term loans to meet their reserve requirements."
        color="#1f77b4"
      />
      
      <IndicatorCard 
        title="Unemployment Rate"
        value={unemployment.value}
        units="%"
        date={unemployment.date}
        trend="down" 
        description="The percentage of the total labor force that is unemployed yet actively seeking employment."
        color="#ff7f0e"
      />
      
      <IndicatorCard 
        title="Consumer Price Index"
        value={cpi.value}
        date={cpi.date}
        trend="up"
        description="A measure of the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services."
        color="#2ca02c"
      />
      
      <IndicatorCard 
        title="Real GDP"
        value={gdp.value}
        units="$B"
        date={gdp.date}
        trend="up"
        description="The inflation-adjusted value of the goods and services produced by labor and property in the United States."
        color="#d62728"
      />
    </div>
  );
};

export default KeyIndicators;