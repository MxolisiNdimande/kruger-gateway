import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AccommodationManager = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    minRating: '',
    maxPrice: '',
    amenities: [],
    gateProximity: '',
    specialFeatures: []
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch accommodations on component load
  useEffect(() => {
    fetchAccommodations();
  }, []);

  // Apply filters when filters or search term change
  useEffect(() => {
    applyFilters();
  }, [accommodations, filters, searchTerm]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/accommodations');
      setAccommodations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...accommodations];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(acc => acc.type === filters.type);
    }

    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(acc => 
        acc.guest_rating >= parseFloat(filters.minRating) || 
        acc.star_rating >= parseInt(filters.minRating)
      );
    }

    // Apply price filter
    if (filters.maxPrice) {
      const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
      filtered = filtered.filter(acc => priceOrder[acc.price_range] <= priceOrder[filters.maxPrice]);
    }

    // Apply amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(acc =>
        filters.amenities.every(amenity => acc.amenities.includes(amenity))
      );
    }

    // Apply gate proximity filter
    if (filters.gateProximity) {
      filtered = filtered.filter(acc => 
        acc.proximity_to_gates.includes(filters.gateProximity)
      );
    }

    // Apply special features filter
    if (filters.specialFeatures.length > 0) {
      filtered = filtered.filter(acc =>
        filters.specialFeatures.every(feature => {
          if (feature === 'women_owned') return acc.is_women_owned;
          if (feature === 'eco_friendly') return acc.is_eco_friendly;
          if (feature === 'family_friendly') return acc.is_family_friendly;
          return false;
        })
      );
    }

    setFilteredAccommodations(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSpecialFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      specialFeatures: prev.specialFeatures.includes(feature)
        ? prev.specialFeatures.filter(f => f !== feature)
        : [...prev.specialFeatures, feature]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minRating: '',
      maxPrice: '',
      amenities: [],
      gateProximity: '',
      specialFeatures: []
    });
    setSearchTerm('');
  };

  const getStarRating = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const getPriceRangeText = (priceRange) => {
    const prices = { '$': 'Budget', '$$': 'Moderate', '$$$': 'Luxury', '$$$$': 'Premium' };
    return prices[priceRange] || priceRange;
  };

  const getAccommodationIcon = (type) => {
    const icons = {
      'Lodge': '🏨',
      'Camp': '⛺',
      'Tented Camp': '🏕️',
      'Rest Camp': '🏠',
      'Hotel': '🏢'
    };
    return icons[type] || '🏨';
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading accommodations...</h2>
        <p>Discovering the best places to stay in Kruger Park</p>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <h1>🏨 Kruger Park Accommodations</h1>
        <p>Find your perfect stay near Kruger National Park</p>
      </header>

      <nav className="nav">
        <Link to="/">📊 Dashboard</Link>
        <Link to="/wildlife">🐘 Wildlife</Link>
        <Link to="/accommodations" className="active">🏨 Accommodations</Link>
      </nav>

      <div className="dashboard">
        {/* Search and Filter Section */}
        <div className="filter-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>🔍 Find Your Perfect Stay</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {showFilters ? '🙈 Hide Filters' : '🔍 Show Filters'}
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search accommodations by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Type Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Accommodation Type:</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="">All Types</option>
                  <option value="Lodge">🏨 Lodge</option>
                  <option value="Camp">⛺ Camp</option>
                  <option value="Tented Camp">🏕️ Tented Camp</option>
                  <option value="Rest Camp">🏠 Rest Camp</option>
                  <option value="Hotel">🏢 Hotel</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Minimum Rating:</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="">Any Rating</option>
                  <option value="4">4★ & above</option>
                  <option value="4.5">4.5★ & above</option>
                  <option value="5">5★ only</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Max Price:</label>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="">Any Price</option>
                  <option value="$">$ Budget</option>
                  <option value="$$">$$ Moderate</option>
                  <option value="$$$">$$$ Luxury</option>
                  <option value="$$$$">$$$$ Premium</option>
                </select>
              </div>

              {/* Gate Proximity */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Near Gate:</label>
                <select
                  value={filters.gateProximity}
                  onChange={(e) => handleFilterChange('gateProximity', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="">Any Gate</option>
                  <option value="Malelane">Malelane Gate</option>
                  <option value="Paul Kruger">Paul Kruger Gate</option>
                  <option value="Phabeni">Phabeni Gate</option>
                  <option value="Numbi">Numbi Gate</option>
                  <option value="Orpen">Orpen Gate</option>
                  <option value="Punda Maria">Punda Maria Gate</option>
                </select>
              </div>
            </div>
          )}

          {/* Amenities and Special Features */}
          {showFilters && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {/* Amenities */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Amenities:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['pool', 'spa', 'wifi', 'restaurant', 'bar', 'safari'].map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      style={{
                        background: filters.amenities.includes(amenity) ? '#4a7c2a' : '#f8f9fa',
                        color: filters.amenities.includes(amenity) ? 'white' : '#333',
                        border: '1px solid #ddd',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Special Features:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    { value: 'women_owned', label: '♀ Women-Owned' },
                    { value: 'eco_friendly', label: '🌿 Eco-Friendly' },
                    { value: 'family_friendly', label: '👨‍👩‍👧‍👦 Family-Friendly' }
                  ].map(feature => (
                    <button
                      key={feature.value}
                      onClick={() => handleSpecialFeatureToggle(feature.value)}
                      style={{
                        background: filters.specialFeatures.includes(feature.value) ? '#4a7c2a' : '#f8f9fa',
                        color: filters.specialFeatures.includes(feature.value) ? 'white' : '#333',
                        border: '1px solid #ddd',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {feature.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter Summary and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Showing {filteredAccommodations.length} of {accommodations.length} accommodations
            </span>
            <button 
              onClick={clearFilters}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>

        {/* Accommodations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredAccommodations.map(accommodation => (
            <div
              key={accommodation.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => setSelectedAccommodation(accommodation)}
            >
              {/* Header with image placeholder */}
              <div style={{
                background: 'linear-gradient(135deg, #4a7c2a, #2d5016)',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem'
              }}>
                {getAccommodationIcon(accommodation.type)}
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#2d5016' }}>{accommodation.name}</h3>
                  <span style={{
                    background: '#4a7c2a',
                    color: 'white',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {getPriceRangeText(accommodation.price_range)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '0.5rem' }}>{accommodation.type}</span>
                  <span style={{ color: '#ffc107', fontSize: '1.1rem' }}>
                    {getStarRating(accommodation.star_rating)}
                  </span>
                  <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    ({accommodation.guest_rating}/5)
                  </span>
                </div>

                <p style={{ 
                  color: '#666', 
                  fontSize: '0.9rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  {accommodation.description}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <div style={{ marginBottom: '0.3rem' }}>
                    <strong>📍 Location:</strong> {accommodation.location}
                  </div>
                  <div>
                    <strong>🚪 Near:</strong> {accommodation.proximity_to_gates}
                  </div>
                </div>

                {/* Special badges */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {accommodation.is_women_owned && (
                    <span style={{ background: '#e83e8c', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                      ♀ Women-Owned
                    </span>
                  )}
                  {accommodation.is_eco_friendly && (
                    <span style={{ background: '#20c997', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                      🌿 Eco-Friendly
                    </span>
                  )}
                  {accommodation.is_family_friendly && (
                    <span style={{ background: '#fd7e14', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                      👨‍👩‍👧‍👦 Family-Friendly
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredAccommodations.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No accommodations found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button 
              onClick={clearFilters}
              style={{
                background: '#4a7c2a',
                color: 'white',
                border: 'none',
                padding: '0.7rem 1.5rem',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Show All Accommodations
            </button>
          </div>
        )}
      </div>

      {/* Accommodation Detail Modal */}
      {selectedAccommodation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedAccommodation(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            
            <div style={{ padding: '2rem' }}>
              <h2 style={{ color: '#2d5016', marginBottom: '1rem' }}>{selectedAccommodation.name}</h2>
              <p>{selectedAccommodation.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div>
                  <h4>Details</h4>
                  <p><strong>Type:</strong> {selectedAccommodation.type}</p>
                  <p><strong>Star Rating:</strong> {getStarRating(selectedAccommodation.star_rating)}</p>
                  <p><strong>Guest Rating:</strong> {selectedAccommodation.guest_rating}/5</p>
                  <p><strong>Price:</strong> {getPriceRangeText(selectedAccommodation.price_range)}</p>
                </div>
                <div>
                  <h4>Location</h4>
                  <p><strong>Area:</strong> {selectedAccommodation.location}</p>
                  <p><strong>Near Gates:</strong> {selectedAccommodation.proximity_to_gates}</p>
                  <p><strong>Contact:</strong> {selectedAccommodation.contact_info}</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4>Amenities</h4>
                <p>{selectedAccommodation.amenities}</p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <a 
                  href={selectedAccommodation.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    background: '#4a7c2a',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🌐 Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationManager;