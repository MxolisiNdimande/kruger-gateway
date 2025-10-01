import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ gates: 0, sightings: 0, animals: 0, accommodations: 0 });
  const [sightings, setSightings] = useState([]);
  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [gatesRes, sightingsRes, accommodationsRes, wildlifeStats] = await Promise.all([
        axios.get('http://localhost:5000/api/wildlife/gates'),
        axios.get('http://localhost:5000/api/wildlife?limit=6'),
        axios.get('http://localhost:5000/api/accommodations?limit=3'),
        axios.get('http://localhost:5000/api/wildlife/stats')
      ]);

      const gatesData = gatesRes.data;
      const sightingsData = sightingsRes.data;
      const accommodationsData = accommodationsRes.data;

      setStats({
        gates: gatesData.length,
        sightings: wildlifeStats.data?.total || sightingsData.length,
        animals: wildlifeStats.data?.byAnimal?.length || new Set(sightingsData.map(s => s.animal_type)).size,
        accommodations: accommodationsData.length
      });

      setSightings(sightingsData.slice(0, 6));
      setFeaturedAccommodations(accommodationsData.slice(0, 3));
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getAnimalEmoji = (animal) => {
    const emojis = {
      lion: '🦁',
      elephant: '🐘', 
      leopard: '🐆',
      rhino: '🦏',
      buffalo: '🐃',
      cheetah: '🐆',
      giraffe: '🦒',
      zebra: '🦓',
      hippo: '🦛'
    };
    return emojis[animal?.toLowerCase()] || '🐾';
  };

  const getProbabilityColor = (probability) => {
    const colors = { high: '#dc3545', medium: '#ffc107', low: '#28a745' };
    return colors[probability] || '#6c757d';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Kruger Park Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h3>❌ Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🦁 Kruger Gateway Discoveries</h1>
          <p>Your complete guide to wildlife sightings and accommodations</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchData} className="refresh-btn">
            🔄 Refresh Data
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <Link to="/wildlife" className="nav-card wildlife-card">
          <span className="nav-icon">🐘</span>
          <span className="nav-text">Wildlife Sightings</span>
        </Link>
        <Link to="/accommodations" className="nav-card accommodations-card">
          <span className="nav-icon">🏨</span>
          <span className="nav-text">Accommodations</span>
        </Link>
        <div className="nav-card stats-card">
          <span className="nav-icon">📊</span>
          <span className="nav-text">Live Dashboard</span>
        </div>
      </nav>

      {/* Stats Overview */}
      <section className="stats-section">
        <h2>📊 Park Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🦁</div>
            <div className="stat-content">
              <h3>{stats.sightings}</h3>
              <p>Total Sightings</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🐾</div>
            <div className="stat-content">
              <h3>{stats.animals}</h3>
              <p>Animal Species</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🚪</div>
            <div className="stat-content">
              <h3>{stats.gates}</h3>
              <p>Park Gates</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏨</div>
            <div className="stat-content">
              <h3>{stats.accommodations}</h3>
              <p>Accommodations</p>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-content">
        {/* Recent Sightings */}
        <section className="recent-sightings">
          <div className="section-header">
            <h2>🦓 Recent Wildlife Sightings</h2>
            <Link to="/wildlife" className="view-all-link">
              View All →
            </Link>
          </div>
          
          <div className="sightings-list">
            {sightings.map(sighting => (
              <div key={sighting.id} className="sighting-item">
                <div className="sighting-icon">
                  {getAnimalEmoji(sighting.animal_type)}
                </div>
                <div className="sighting-details">
                  <h4>{sighting.animal_type}</h4>
                  <p className="sighting-location">
                    {sighting.gate_name || 'Unknown Gate'}
                  </p>
                  <div className="sighting-meta">
                    <span 
                      className="probability-badge"
                      style={{ backgroundColor: getProbabilityColor(sighting.probability) }}
                    >
                      {sighting.probability}
                    </span>
                    <span className="time-ago">{getTimeAgo(sighting.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Accommodations */}
        <section className="featured-accommodations">
          <div className="section-header">
            <h2>🏨 Featured Stays</h2>
            <Link to="/accommodations" className="view-all-link">
              View All →
            </Link>
          </div>
          
          <div className="accommodations-grid">
            {featuredAccommodations.map(accommodation => (
              <div key={accommodation.id} className="accommodation-card">
                <div className="accommodation-image">
                  {accommodation.images && accommodation.images.length > 0 ? (
                    <img 
                      src={accommodation.images[0]} 
                      alt={accommodation.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder">
                    🏨
                  </div>
                </div>
                
                <div className="accommodation-content">
                  <h4>{accommodation.name}</h4>
                  <p className="accommodation-type">{accommodation.type}</p>
                  
                  <div className="accommodation-rating">
                    <span className="stars">
                      {'★'.repeat(accommodation.star_rating || 3)}{'☆'.repeat(5 - (accommodation.star_rating || 3))}
                    </span>
                    <span className="rating-text">
                      {accommodation.guest_rating || '4.0'}/5
                    </span>
                  </div>
                  
                  <div className="accommodation-price">
                    {accommodation.price_range || '$$'} • {accommodation.location}
                  </div>
                  
                  <div className="accommodation-features">
                    {accommodation.is_eco_friendly && <span className="feature-badge eco">🌿</span>}
                    {accommodation.is_family_friendly && <span className="feature-badge family">👪</span>}
                    {accommodation.is_women_owned && <span className="feature-badge women">♀</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/wildlife" className="action-card">
              <span className="action-icon">🔍</span>
              <span className="action-text">Track Wildlife</span>
            </Link>
            
            <Link to="/accommodations" className="action-card">
              <span className="action-icon">🏨</span>
              <span className="action-text">Find Stays</span>
            </Link>
            
            <a 
              href="http://localhost:5000/api/setup-data" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-card"
            >
              <span className="action-icon">🦁</span>
              <span className="action-text">Load Sample Data</span>
            </a>
            
            <a 
              href="http://localhost:5000/api/debug/data" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-card"
            >
              <span className="action-icon">📊</span>
              <span className="action-text">View Raw Data</span>
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>
          🦁 Kruger Gateway Discoveries • 
          Real-time wildlife tracking and accommodation finder
        </p>
        <div className="footer-links">
          <span>{new Date().toLocaleDateString()}</span>
          <span>•</span>
          <span>Data updates automatically</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;