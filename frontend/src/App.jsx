// In your App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import WildlifeSightings from './components/WildlifeSightings';
import AccommodationManager from './components/AccommodationManager';
import MpumalangaTourism from './components/MpumalangaTourism'; // Add this import
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wildlife" element={<WildlifeSightings />} />
          <Route path="/accommodations" element={<AccommodationManager />} />
          <Route path="/tourism" element={<MpumalangaTourism />} /> {/* Add this route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;