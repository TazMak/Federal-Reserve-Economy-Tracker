import axios from 'axios';

// axios instance with default config
const api = axios.create({
  baseURL: 'https://federal-reserve-economy-tracker.onrender.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
const endpoints = {

  getIndicators: () => api.get('/indicators'),
  
  // this is getting specific indicator data
  getIndicator: (seriesId, startDate, endDate, frequency) => {
    let url = `/indicator/${seriesId}`;
    const params = {};
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (frequency) params.frequency = frequency;
    
    return api.get(url, { params });
  },
  
  getLatestValue: (seriesId) => api.get(`/latest/${seriesId}`),
  
  getDashboardData: () => api.get('/dashboard'),
};

export default endpoints;