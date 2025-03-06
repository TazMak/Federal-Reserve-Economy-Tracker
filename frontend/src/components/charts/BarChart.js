import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
// Import required Chart.js adapters
import 'chartjs-adapter-date-fns';
import { formatDate } from '../../utils/dateUtils';

/**
 * BarChart component for displaying time series data as bars
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects
 * @param {string} props.xKey - Key for X-axis values in data objects
 * @param {string} props.yKey - Key for Y-axis values in data objects
 * @param {string} props.title - Chart title
 * @param {Function} props.tooltipFormatter - Function to format tooltip values
 */
const BarChart = ({ 
  data, 
  xKey = 'date', 
  yKey = 'value', 
  title = '',
  tooltipFormatter = null
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // refreshing the chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (!data || data.length === 0 || !chartRef.current) {
      return;
    }
    
    const ctx = chartRef.current.getContext('2d');
    
    // Determine positive and negative values to color bars accordingly
    const positiveColor = 'rgba(77, 175, 74, 0.7)';  // Green
    const negativeColor = 'rgba(214, 39, 40, 0.7)';  // Red
    const borderPositiveColor = 'rgba(77, 175, 74, 1)';
    const borderNegativeColor = 'rgba(214, 39, 40, 1)';
    
    const colors = data.map(item => parseFloat(item[yKey]) >= 0 ? positiveColor : negativeColor);
    const borderColors = data.map(item => parseFloat(item[yKey]) >= 0 ? borderPositiveColor : borderNegativeColor);
    
    // Prepare chart data
    const chartData = {
      labels: data.map(item => item[xKey]),
      datasets: [
        {
          label: title,
          data: data.map(item => item[yKey]),
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    };
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                // Format the date for tooltip title
                return formatDate(tooltipItems[0].label);
              },
              label: function(context) {
                let value = context.parsed.y;
                
                // Use custom formatter if provided
                if (tooltipFormatter) {
                  return tooltipFormatter(value);
                }
                
                // Default formatting
                return value.toFixed(2);
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'yyyy-MM-dd',
              tooltipFormat: 'MMM d, yyyy',
              unit: 'quarter',
              displayFormats: {
                quarter: 'MMM yyyy'
              }
            },
            title: {
              display: false
            },
            grid: {
              display: false
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: false
            },
            grid: {
              color: '#eee'
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
  }, [data, xKey, yKey, title, tooltipFormatter]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} height="250"></canvas>
    </div>
  );
};

export default BarChart;