import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ gates: 0, sightings: 0, animals: 0, accommodations: 0 });
  const [sightings, setSightings] = useState([]);
  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [tourismStats, setTourismStats] = useState({ destinations: 8, activities: 12, businesses: 6 }); // Add tourism stats
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

      {/* Navigation - ADD TOURISM LINK */}
      <nav className="dashboard-nav">
        <Link to="/wildlife" className="nav-card wildlife-card">
          <span className="nav-icon">🐘</span>
          <span className="nav-text">Wildlife Sightings</span>
        </Link>
        <Link to="/accommodations" className="nav-card accommodations-card">
          <span className="nav-icon">🏨</span>
          <span className="nav-text">Accommodations</span>
        </Link>
        <Link to="/tourism" className="nav-card tourism-card"> {/* NEW TOURISM CARD */}
          <span className="nav-icon">🏞️</span>
          <span className="nav-text">Mpumalanga Tourism</span>
        </Link>
        <div className="nav-card stats-card">
          <span className="nav-icon">📊</span>
          <span className="nav-text">Live Dashboard</span>
        </div>
      </nav>

      {/* Stats Overview - ADD TOURISM STATS */}
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

          {/* NEW TOURISM STATS */}
          <div className="stat-card">
            <div className="stat-icon">🏞️</div>
            <div className="stat-content">
              <h3>{tourismStats.destinations}</h3>
              <p>Destinations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{tourismStats.activities}</h3>
              <p>Activities</p>
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

        {/* NEW MPUMALANGA TOURISM SECTION */}
        <section className="mpumalanga-tourism-preview">
          <div className="section-header">
            <h2>🏞️ Mpumalanga Tourism</h2>
            <Link to="/tourism" className="view-all-link">
              Explore All →
            </Link>
          </div>
          
          <div className="tourism-highlights">
            <div className="tourism-card">
              <div className="tourism-icon">🦁</div>
              <div className="tourism-content">
                <h4>Kruger National Park</h4>
                <p>World-renowned safari destination with Big Five sightings</p>
                <div className="tourism-features">
                  <span className="feature-tag">Safari</span>
                  <span className="feature-tag">Wildlife</span>
                  <span className="feature-tag">Big Five</span>
                </div>
                <Link to="/tourism" className="tourism-link">
                  Explore Kruger →
                </Link>
              </div>
            </div>

            <div className="tourism-card">
              <div className="tourism-icon">🌄</div>
              <div className="tourism-content">
                <h4>Panorama Route</h4>
                <p>Breathtaking viewpoints including God's Window and Blyde Canyon</p>
                <div className="tourism-features">
                  <span className="feature-tag">Scenic</span>
                  <span className="feature-tag">Viewpoints</span>
                  <span className="feature-tag">Photography</span>
                </div>
                <Link to="/tourism" className="tourism-link">
                  Discover Scenery →
                </Link>
              </div>
            </div>

            <div className="tourism-card">
              <div className="tourism-icon">🌺</div>
              <div className="tourism-content">
                <h4>Spring Activities</h4>
                <p>Seasonal adventures including wildflower tours and bird watching</p>
                <div className="tourism-features">
                  <span className="feature-tag">Seasonal</span>
                  <span className="feature-tag">Adventure</span>
                  <span className="feature-tag">Nature</span>
                </div>
                <Link to="/tourism" className="tourism-link">
                  View Activities →
                </Link>
              </div>
            </div>
          </div>

          <div className="tourism-cta">
            <p>🌿 <strong>Complete Your Safari Experience</strong> - Combine wildlife tracking with tourism destinations</p>
            <Link to="/tourism" className="cta-button">
              Build My Mpumalanga Itinerary
            </Link>
          </div>
        </section>

        {/* Quick Actions - ADD TOURISM ACTION */}
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

            <Link to="/tourism" className="action-card"> {/* NEW TOURISM ACTION */}
              <span className="action-icon">🏞️</span>
              <span className="action-text">Explore Tourism</span>
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
          <span>•</span>
          <Link to="/tourism">🏞️ Mpumalanga Tourism</Link> {/* ADD TOURISM LINK */}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;