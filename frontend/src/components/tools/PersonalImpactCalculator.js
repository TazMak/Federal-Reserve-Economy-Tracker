// src/components/tools/PersonalImpactCalculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatUtils';

const PersonalImpactCalculator = () => {
  // Economic data from API
  const [economicData, setEconomicData] = useState({
    inflation: 3.1,     // Current inflation rate (%)
    fedRate: 5.5,       // Current Fed Funds Rate (%)
    mortgageRate: 7.1,  // Current 30-year mortgage rate (%)
    unemploymentRate: 3.8, // Current unemployment rate (%)
  });
  
  // User input values with defaults
  const [income, setIncome] = useState(60000);
  const [expenses, setExpenses] = useState(48000);
  const [savings, setSavings] = useState(25000);
  const [mortgage, setMortgage] = useState(300000);
  const [mortgageTerm, setMortgageTerm] = useState(30);
  const [mortgageRate, setMortgageRate] = useState(economicData.mortgageRate);
  const [hasVariableRateLoan, setHasVariableRateLoan] = useState(false);
  
  // Calculated impacts
  const [impacts, setImpacts] = useState({
    inflationImpact: 0,
    savingsImpact: 0,
    mortgageImpact: 0,
    totalImpact: 0,
    currentMortgagePayment: 0,
    newMortgagePayment: 0,
  });
  
  // Fetch current economic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch latest values from your API
        const response = await axios.get('/api/dashboard');
        
        // Update with real data if available
        if (response.data) {
          // Validate inflation data - if it's unusually high (>50%), 
          // assume it was multiplied by 100 erroneously
          let inflationValue = response.data.CPIAUCSL?.value || 3.1;
          if (inflationValue > 50) {
            // Likely a display error, divide by 100 to fix
            inflationValue = inflationValue / 100;
            console.warn("Corrected unusually high inflation value (divided by 100)");
          }
          
          setEconomicData({
            inflation: inflationValue,
            fedRate: response.data.FEDFUNDS?.value || 5.5,
            mortgageRate: 7.1, // This usually isn't in FRED, would need another source
            unemploymentRate: response.data.UNRATE?.value || 3.8,
          });
        }
      } catch (err) {
        console.error('Error fetching economic data:', err);
        // Keep default values if fetch fails
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate impacts when inputs change
  useEffect(() => {
    // Make sure inflation is properly represented as a percentage
    // If inflation is 3.1, it means 3.1%, so divide by 100 for decimal calculations
    const inflationRate = economicData.inflation;
    const annualInflationCost = expenses * (inflationRate / 100);
    
    // Calculate impact on savings interest
    const savingsInterestRate = economicData.fedRate / 2; // Simplification: savings rates are typically lower than Fed rate
    const annualSavingsInterest = savings * (savingsInterestRate / 100);
    
    // Calculate mortgage payment impacts
    const calculateMortgagePayment = (principal, rate, years) => {
      const monthlyRate = rate / 100 / 12;
      const payments = years * 12;
      if (monthlyRate === 0) return principal / payments;
      return principal * monthlyRate * Math.pow(1 + monthlyRate, payments) / (Math.pow(1 + monthlyRate, payments) - 1);
    };
    
    // Current mortgage payment
    const currentMonthlyPayment = calculateMortgagePayment(mortgage, mortgageRate, mortgageTerm);
    
    // If variable rate loan, calculate with a 1% increase
    const newRate = hasVariableRateLoan ? mortgageRate + 1 : mortgageRate;
    const newMonthlyPayment = calculateMortgagePayment(mortgage, newRate, mortgageTerm);
    
    // Annual mortgage rate impact
    const mortgageRateImpact = hasVariableRateLoan ? (newMonthlyPayment - currentMonthlyPayment) * 12 : 0;
    
    // Total financial impact (negative means cost to you, positive means benefit)
    const totalImpact = (annualSavingsInterest - annualInflationCost - mortgageRateImpact);
    
    setImpacts({
      inflationImpact: -annualInflationCost,
      savingsImpact: annualSavingsInterest,
      mortgageImpact: -mortgageRateImpact,
      totalImpact: totalImpact,
      currentMortgagePayment: currentMonthlyPayment,
      newMortgagePayment: hasVariableRateLoan ? newMonthlyPayment : currentMonthlyPayment,
    });
  }, [economicData, income, expenses, savings, mortgage, mortgageTerm, mortgageRate, hasVariableRateLoan]);
  
  // Format currency values for display
  const formatValue = (value) => {
    return formatCurrency(value, 'USD', 0);
  };
  
  // Get impact class for styling
  const getImpactClass = (value) => {
    return value >= 0 ? 'positive-impact' : 'negative-impact';
  };
  
  return (
    <div className="personal-impact-calculator">
      <h2>Personal Economic Impact Calculator</h2>
      <p className="calculator-description">
        See how current economic conditions affect your personal finances. Enter your financial details below.
      </p>
      
      <div className="calculator-container">
        <div className="current-economics">
          <h3>Current Economic Conditions</h3>
          <div className="economics-grid">
            <div className="economic-item">
              <label>Inflation Rate:</label>
              <span className="economic-value">
                {/* Add validation to prevent displaying unrealistic values */}
                {economicData.inflation > 50 ? (economicData.inflation / 100).toFixed(1) : economicData.inflation.toFixed(1)}%
              </span>
            </div>
            <div className="economic-item">
              <label>Federal Funds Rate:</label>
              <span className="economic-value">{economicData.fedRate.toFixed(2)}%</span>
            </div>
            <div className="economic-item">
              <label>Average Mortgage Rate:</label>
              <span className="economic-value">{economicData.mortgageRate.toFixed(2)}%</span>
            </div>
            <div className="economic-item">
              <label>Unemployment Rate:</label>
              <span className="economic-value">{economicData.unemploymentRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="calculator-inputs">
          <h3>Your Financial Information</h3>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="annual-income">Annual Income:</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="annual-income"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="annual-expenses">Annual Expenses:</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="annual-expenses"
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="savings-balance">Savings Balance:</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="savings-balance"
                  type="number"
                  value={savings}
                  onChange={(e) => setSavings(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="mortgage-balance">Mortgage Balance:</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="mortgage-balance"
                  type="number"
                  value={mortgage}
                  onChange={(e) => setMortgage(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="mortgage-term">Mortgage Term (Years):</label>
              <input
                id="mortgage-term"
                type="number"
                value={mortgageTerm}
                onChange={(e) => setMortgageTerm(Number(e.target.value))}
                min="1"
                max="30"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="mortgage-rate">Current Mortgage Rate (%):</label>
              <input
                id="mortgage-rate"
                type="number"
                value={mortgageRate}
                onChange={(e) => setMortgageRate(Number(e.target.value))}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={hasVariableRateLoan}
                  onChange={(e) => setHasVariableRateLoan(e.target.checked)}
                />
                I have an adjustable-rate loan/mortgage
              </label>
            </div>
          </div>
        </div>
        
        <div className="calculator-results">
          <h3>Annual Economic Impact</h3>
          
          <div className="impact-item">
            <div className="impact-label">Inflation Cost to You:</div>
            <div className={`impact-value ${getImpactClass(impacts.inflationImpact)}`}>
              {formatValue(impacts.inflationImpact)}
            </div>
            <div className="impact-explanation">
              This is how much more you'll pay for the same goods and services due to current inflation.
            </div>
          </div>
          
          <div className="impact-item">
            <div className="impact-label">Savings Interest Benefit:</div>
            <div className={`impact-value ${getImpactClass(impacts.savingsImpact)}`}>
              {formatValue(impacts.savingsImpact)}
            </div>
            <div className="impact-explanation">
              Estimated interest earned on your savings at current rates (assumes {(economicData.fedRate / 2).toFixed(1)}% APY).
            </div>
          </div>
          
          {hasVariableRateLoan && (
            <div className="impact-item">
              <div className="impact-label">Mortgage Rate Impact:</div>
              <div className={`impact-value ${getImpactClass(impacts.mortgageImpact)}`}>
                {formatValue(impacts.mortgageImpact)}
              </div>
              <div className="impact-explanation">
                Assuming rates increase 1% on your adjustable-rate loan.
              </div>
            </div>
          )}
          
          <div className="impact-item total-impact">
            <div className="impact-label">Total Annual Impact:</div>
            <div className={`impact-value ${getImpactClass(impacts.totalImpact)}`}>
              {formatValue(impacts.totalImpact)}
            </div>
            <div className="impact-explanation">
              The combined effect of current economic conditions on your finances per year.
            </div>
          </div>
          
          <div className="mortgage-payment-section">
            <h4>Monthly Mortgage Payment</h4>
            <div className="payment-comparison">
              <div className="payment-item">
                <div className="payment-label">Current Payment:</div>
                <div className="payment-value">{formatValue(impacts.currentMortgagePayment)}/month</div>
              </div>
              
              {hasVariableRateLoan && (
                <div className="payment-item">
                  <div className="payment-label">If Rates Rise 1%:</div>
                  <div className="payment-value">{formatValue(impacts.newMortgagePayment)}/month</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="calculator-disclaimer">
        <p><em>Note: This calculator provides estimates based on current economic conditions and your inputs. Actual impacts may vary based on your specific financial situation, local economic conditions, and future changes in economic indicators.</em></p>
      </div>
    </div>
  );
};

export default PersonalImpactCalculator;