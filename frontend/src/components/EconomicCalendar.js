// src/components/EconomicCalendar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EconomicCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const filterOptions = [
    { id: 'all', name: 'All Events' },
    { id: 'fomc', name: 'FOMC Meetings' },
    { id: 'inflation', name: 'Inflation Reports' },
    { id: 'employment', name: 'Employment Reports' },
    { id: 'gdp', name: 'GDP Reports' }
  ];
  
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API
        const response = await axios.get('/api/economic-calendar');
        setEvents(response.data.events);
        
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        // Simulate data for demo
        setEvents(generateSimulatedEvents());
        setError(null); // Clear error since we're using simulated data
      } finally {
        setLoading(false);
      }
    };
    
    fetchCalendarEvents();
  }, []);
  
  // Generate simulated events for demo purposes
  const generateSimulatedEvents = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create dates for this month and next two months
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const month = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      
      // How many days in this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        dates.push(new Date(year, month, day));
      }
    }
    
    // Sample event types and descriptions
    const eventTypes = [
      { id: 'fomc', name: 'FOMC Meeting', importance: 'high' },
      { id: 'fomc_minutes', name: 'FOMC Minutes Release', importance: 'medium', category: 'fomc' },
      { id: 'cpi', name: 'CPI Release', importance: 'high', category: 'inflation' },
      { id: 'ppi', name: 'PPI Release', importance: 'medium', category: 'inflation' },
      { id: 'employment', name: 'Employment Situation', importance: 'high', category: 'employment' },
      { id: 'jobless_claims', name: 'Initial Jobless Claims', importance: 'medium', category: 'employment' },
      { id: 'gdp', name: 'GDP Release', importance: 'high', category: 'gdp' },
      { id: 'retail_sales', name: 'Retail Sales', importance: 'medium', category: 'other' },
      { id: 'ism_manufacturing', name: 'ISM Manufacturing PMI', importance: 'medium', category: 'other' },
      { id: 'housing_starts', name: 'Housing Starts', importance: 'low', category: 'other' }
    ];
    
    // Create events
    const events = [];
    
    // FOMC meetings (roughly every 6 weeks)
    let fomcDate = new Date(currentYear, currentMonth, 15);
    for (let i = 0; i < 3; i++) {
      fomcDate = new Date(fomcDate.getTime() + (42 * 24 * 60 * 60 * 1000)); // Add ~6 weeks
      
      if (fomcDate >= currentDate) {
        events.push({
          id: `fomc-${i}`,
          title: 'FOMC Meeting',
          date: fomcDate.toISOString().split('T')[0],
          time: '14:00',
          type: 'fomc',
          category: 'fomc',
          importance: 'high',
          description: 'Federal Open Market Committee meeting to set monetary policy.',
          previousValue: 'Federal Funds Rate: 5.25%-5.50%'
        });
        
        // FOMC Minutes come out 3 weeks after the meeting
        const minutesDate = new Date(fomcDate.getTime() + (21 * 24 * 60 * 60 * 1000));
        events.push({
          id: `fomc-minutes-${i}`,
          title: 'FOMC Minutes',
          date: minutesDate.toISOString().split('T')[0],
          time: '14:00',
          type: 'fomc_minutes',
          category: 'fomc',
          importance: 'medium',
          description: 'Minutes from the previous Federal Open Market Committee meeting.',
          previousValue: null
        });
      }
    }
    
    // Monthly economic indicators
    for (let i = 0; i < dates.length; i += 28) { // Roughly monthly
      const baseDate = dates[i];
      
      // CPI is usually released around the 10th of the month
      if (baseDate.getDate() <= 10) {
        const cpiDate = new Date(baseDate);
        cpiDate.setDate(10 + Math.floor(Math.random() * 3)); // 10th-12th
        
        if (cpiDate >= currentDate) {
          events.push({
            id: `cpi-${i}`,
            title: 'Consumer Price Index',
            date: cpiDate.toISOString().split('T')[0],
            time: '08:30',
            type: 'cpi',
            category: 'inflation',
            importance: 'high',
            description: 'Measures changes in the prices paid by consumers for goods and services.',
            previousValue: '+0.2% m/m, +3.1% y/y'
          });
        }
      }
      
      // Jobs report is released the first Friday of the month
      const firstFriday = new Date(baseDate);
      firstFriday.setDate(1);
      while (firstFriday.getDay() !== 5) {
        firstFriday.setDate(firstFriday.getDate() + 1);
      }
      
      if (firstFriday >= currentDate) {
        events.push({
          id: `employment-${i}`,
          title: 'Employment Situation',
          date: firstFriday.toISOString().split('T')[0],
          time: '08:30',
          type: 'employment',
          category: 'employment',
          importance: 'high',
          description: 'Monthly report on employment, unemployment rate, and wages.',
          previousValue: 'Unemployment Rate: 3.8%, Nonfarm Payrolls: +216K'
        });
      }
      
      // GDP is released near the end of the month
      const gdpDate = new Date(baseDate);
      gdpDate.setDate(25 + Math.floor(Math.random() * 3)); // 25th-27th
      
      if (gdpDate >= currentDate && [0, 3, 6, 9].includes(gdpDate.getMonth())) { // Quarterly
        events.push({
          id: `gdp-${i}`,
          title: 'Gross Domestic Product',
          date: gdpDate.toISOString().split('T')[0],
          time: '08:30',
          type: 'gdp',
          category: 'gdp',
          importance: 'high',
          description: 'Quarterly report on the total value of goods and services produced.',
          previousValue: '+3.2% q/q SAAR'
        });
      }
      
      // Weekly jobless claims on Thursdays
      for (let j = 0; j < 30; j += 7) {
        if (i + j < dates.length) {
          const claimsDate = new Date(dates[i + j]);
          if (claimsDate.getDay() === 4 && claimsDate >= currentDate) { // Thursday
            events.push({
              id: `jobless-claims-${i}-${j}`,
              title: 'Initial Jobless Claims',
              date: claimsDate.toISOString().split('T')[0],
              time: '08:30',
              type: 'jobless_claims',
              category: 'employment',
              importance: 'medium',
              description: 'Weekly report on the number of new jobless claims filed.',
              previousValue: '218K'
            });
          }
        }
      }
    }
    
    // Sort by date
    events.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    return events;
  };
  
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  
  // Filter events based on selected category
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.category === filter);
  
  // Group events by month and day
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = new Date(event.date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const day = date.getDate();
    
    if (!groups[month]) {
      groups[month] = {};
    }
    
    if (!groups[month][day]) {
      groups[month][day] = [];
    }
    
    groups[month][day].push(event);
    return groups;
  }, {});
  
  // Get importance class for styling
  const getImportanceClass = (importance) => {
    switch (importance) {
      case 'high':
        return 'high-importance';
      case 'medium':
        return 'medium-importance';
      case 'low':
        return 'low-importance';
      default:
        return '';
    }
  };
  
  return (
    <div className="economic-calendar">
      <h2>Economic Calendar</h2>
      
      <div className="calendar-controls">
        <div className="selector">
          <label htmlFor="filter-select">Filter Events: </label>
          <select 
            id="filter-select" 
            value={filter} 
            onChange={handleFilterChange}
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading calendar events...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="calendar-content">
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="importance-indicator high-importance"></span>
              <span>High Impact</span>
            </div>
            <div className="legend-item">
              <span className="importance-indicator medium-importance"></span>
              <span>Medium Impact</span>
            </div>
            <div className="legend-item">
              <span className="importance-indicator low-importance"></span>
              <span>Low Impact</span>
            </div>
          </div>
          
          {Object.keys(groupedEvents).length > 0 ? (
            Object.entries(groupedEvents).map(([month, days]) => (
              <div key={month} className="calendar-month">
                <h3 className="month-header">{month}</h3>
                
                {Object.entries(days).map(([day, dayEvents]) => (
                  <div key={`${month}-${day}`} className="calendar-day">
                    <div className="day-header">
                      <span className="day-number">{day}</span>
                      <span className="day-name">
                        {new Date(dayEvents[0].date).toLocaleString('default', { weekday: 'long' })}
                      </span>
                    </div>
                    
                    <div className="day-events">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id} 
                          className={`calendar-event ${getImportanceClass(event.importance)}`}
                        >
                          <div className="event-time">{event.time}</div>
                          <div className="event-details">
                            <div className="event-title">{event.title}</div>
                            <div className="event-description">{event.description}</div>
                            {event.previousValue && (
                              <div className="event-previous">Previous: {event.previousValue}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="no-events">No events found for the selected filter.</div>
          )}
        </div>
      )}
      
      <div className="calendar-disclaimer">
        <p><em>Note: Release dates and times are subject to change. Data shown is for demonstration purposes only.</em></p>
      </div>
    </div>
  );
};

export default EconomicCalendar;