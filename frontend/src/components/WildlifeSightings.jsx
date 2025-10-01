import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🐘 Wildlife Sightings</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🐘 Wildlife Sightings</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchWildlifeData}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2d5016' }}>🐘 Kruger Park Wildlife Sightings</h1>
        <p>Real-time animal sightings from across the park</p>
      </header>

      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '30px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <Link to="/">📊 Dashboard</Link>
        <Link 
          to="/wildlife" 
          style={{ 
            background: '#2d5016', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '5px',
            textDecoration: 'none'
          }}
        >
          🐘 Wildlife
        </Link>
        <Link to="/accommodations" style={{ textDecoration: 'none', color: '#555' }}>
          🏨 Accommodations
        </Link>
      </nav>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '30px' 
      }}>
        <h3>🔍 Found {filteredSightings.length} Sightings</h3>
        <p>Data loaded from backend API</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredSightings.map(sighting => (
          <div
            key={sighting.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ fontSize: '2rem', marginRight: '15px' }}>
                {getAnimalIcon(sighting.animal_type)}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#2d5016' }}>{sighting.animal_type}</h3>
                <small>{sighting.confidence}</small>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div 
                style={{ 
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: getProbabilityColor(sighting.probability),
                  width: sighting.probability === 'high' ? '100%' : 
                         sighting.probability === 'medium' ? '66%' : '33%',
                  marginBottom: '5px'
                }}
              ></div>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                {sighting.probability} probability
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', minWidth: '80px' }}>📍 Gate:</span>
                <span>{sighting.gate_name || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', minWidth: '80px' }}>🕒 Time:</span>
                <span>{new Date(sighting.created_at).toLocaleString()}</span>
              </div>
              {sighting.notes && (
                <div style={{ display: 'flex' }}>
                  <span style={{ fontWeight: '600', minWidth: '80px' }}>📝 Notes:</span>
                  <span style={{ fontStyle: 'italic' }}>{sighting.notes}</span>
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