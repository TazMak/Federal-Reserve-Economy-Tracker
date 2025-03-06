import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
// Import required Chart.js adapters
import 'chartjs-adapter-date-fns'; 
import { formatDate } from '../../utils/dateUtils';

const LineChart = ({ 
  data, 
  xKey = 'date', 
  yKey = 'value', 
  color = '#1f77b4',
  title = '',
  tooltipFormatter = null
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // If chart already exists, destroy it before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (!data || data.length === 0 || !chartRef.current) {
      return;
    }
    
    const ctx = chartRef.current.getContext('2d');
    
    // Prepare chart data
    const chartData = {
      labels: data.map(item => item[xKey]),
      datasets: [
        {
          label: title,
          data: data.map(item => item[yKey]),
          borderColor: color,
          backgroundColor: color + '20', // Add transparency
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.1 // Slight curve for lines
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
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
              unit: 'month',
              displayFormats: {
                month: 'MMM yyyy'
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
              maxTicksLimit: 12
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
  }, [data, xKey, yKey, color, title, tooltipFormatter]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} height="250"></canvas>
    </div>
  );
};

export default LineChart;