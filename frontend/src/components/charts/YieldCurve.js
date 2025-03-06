import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

/**
 * YieldCurve component for displaying Treasury yield curve
 * @param {Object} props - Component props
 * @param {Object} props.data - Yield curve data object with maturities as keys and yields as values
 * @param {string} props.date - Date of the yield curve data
 */
const YieldCurve = ({ 
  data = {}, 
  date = '' 
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // If chart already exists, destroy it before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (!data || Object.keys(data).length === 0 || !chartRef.current) {
      return;
    }
    
    const ctx = chartRef.current.getContext('2d');
    
    // Define the standard order of Treasury maturities
    const maturities = ['1 Mo', '3 Mo', '6 Mo', '1 Yr', '2 Yr', '3 Yr', '5 Yr', '7 Yr', '10 Yr', '20 Yr', '30 Yr'];
    
    // Filter and sort the data based on available maturities
    const filteredMaturities = maturities.filter(maturity => data[maturity] !== undefined);
    const yields = filteredMaturities.map(maturity => data[maturity]);
    
    // Prepare chart data
    const chartData = {
      labels: filteredMaturities,
      datasets: [
        {
          label: 'Treasury Yield Curve',
          data: yields,
          borderColor: '#3366cc',
          backgroundColor: 'rgba(51, 102, 204, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Treasury Yield Curve (${date})`,
            font: {
              size: 16
            }
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Maturity',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Yield (%)',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: '#eee'
            },
            ticks: {
              callback: function(value) {
                return value.toFixed(2) + '%';
              }
            }
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, date]);

  return (
    <div className="chart-container" style={{ height: '350px' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default YieldCurve;