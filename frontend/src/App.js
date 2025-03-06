import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import InterestRates from './components/indicators/InterestRates';
import Inflation from './components/indicators/Inflation';
import Unemployment from './components/indicators/Unemployment';
import GDP from './components/indicators/GDP';

// styling
import './assets/styles/main.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="app">
        <Header toggleSidebar={toggleSidebar} />
        <div className="main-container">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/interest-rates" element={<InterestRates />} />
              <Route path="/inflation" element={<Inflation />} />
              <Route path="/unemployment" element={<Unemployment />} />
              <Route path="/gdp" element={<GDP />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;