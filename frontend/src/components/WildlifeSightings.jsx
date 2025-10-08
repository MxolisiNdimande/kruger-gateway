import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './WildlifeSightings.css';

const WildlifeSightings = () => {
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWildlifeData();
  }, []);

  const fetchWildlifeData = async () => {
    try {
      setLoading(true);
      
      const [sightingsResponse, gatesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/wildlife'),
        axios.get('http://localhost:5000/api/wildlife/gates')
      ]);
      
      setSightings(sightingsResponse.data);
      setGates(gatesResponse.data);
      setFilteredSightings(sightingsResponse.data);
      setLoading(false);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load data. Check if backend is running.');
      setLoading(false);
    }
  };

  const getAnimalIcon = (animalType) => {
    const iconMap = {
      lion: '🦁', elephant: '🐘', leopard: '🐆', buffalo: '🐃', 
      rhino: '🦏', cheetah: '🐆', giraffe: '🦒', zebra: '🦓'
    };
    return iconMap[animalType?.toLowerCase()] || '🐾';
  };

  const getProbabilityColor = (probability) => {
    const colors = { high: '#dc3545', medium: '#ffc107', low: '#28a745' };
    return colors[probability] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="wildlife-loading">
        <h1>🐘 Wildlife Sightings</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wildlife-error">
        <h1>🐘 Wildlife Sightings</h1>
        <p className="error-message">{error}</p>
        <button onClick={fetchWildlifeData} className="retry-button">Try Again</button>
      </div>
    );
  }

  return (
    <div className="wildlife-container">
      <header className="wildlife-header">
        <h1>🐘 Kruger Park Wildlife Sightings</h1>
        <p>Real-time animal sightings from across the park</p>
      </header>

      {/* Quick Navigation Buttons */}
      <div className="quick-nav">
        <Link to="/" className="quick-nav-button">
          ← Back to Dashboard
        </Link>
        <Link to="/wildlife" className="quick-nav-button active">
          🐘 Wildlife Sightings
        </Link>
        <Link to="/accommodations" className="quick-nav-button">
          🏨 Accommodations
        </Link>
        <Link to="/tourism" className="quick-nav-button">
          🌄 Tourism
        </Link>
      </div>

     
      <div className="sightings-summary">
        <h3>🔍 Found {filteredSightings.length} Sightings</h3>
        <p>Data loaded from backend API</p>
      </div>

      <div className="sightings-grid">
        {filteredSightings.map(sighting => (
          <div
            key={sighting.id}
            className="sighting-card"
          >
            <div className="sighting-header">
              <div className="animal-icon">
                {getAnimalIcon(sighting.animal_type)}
              </div>
              <div className="animal-info">
                <h3>{sighting.animal_type}</h3>
                <small>{sighting.confidence}</small>
              </div>
            </div>

            <div className="probability-indicator">
              <div 
                className="probability-bar"
                style={{ 
                  backgroundColor: getProbabilityColor(sighting.probability),
                  width: sighting.probability === 'high' ? '100%' : 
                         sighting.probability === 'medium' ? '66%' : '33%',
                }}
              ></div>
              <span className="probability-text">
                {sighting.probability} probability
              </span>
            </div>

            <div className="sighting-details">
              <div className="detail-row">
                <span className="detail-label">📍 Gate:</span>
                <span className="detail-value">{sighting.gate_name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">🕒 Time:</span>
                <span className="detail-value">{new Date(sighting.created_at).toLocaleString()}</span>
              </div>
              {sighting.notes && (
                <div className="detail-row">
                  <span className="detail-label">📝 Notes:</span>
                  <span className="detail-value notes">{sighting.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WildlifeSightings;