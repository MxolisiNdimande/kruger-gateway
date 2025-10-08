import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AccommodationManager = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

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

  // Styles object
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      width: '100vw',
      margin: 0,
      padding: 0,
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      textAlign: 'center',
      padding: '2rem',
      width: '100%',
    },
    header: {
      background: 'linear-gradient(135deg, #4a7c2a, #2d5016)',
      color: 'white',
      padding: '2rem 1rem',
      textAlign: 'center',
      width: '100%',
    },
    headerTitle: {
      margin: '0 0 0.5rem 0',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: '700',
    },
    headerSubtitle: {
      margin: 0,
      fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
      opacity: 0.9,
    },
    // Quick Navigation Styles
    quickNav: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      margin: '1rem auto',
      padding: '0 1rem',
      flexWrap: 'wrap',
      maxWidth: '1400px',
    },
    quickNavButton: {
      background: '#f8f9fa',
      color: '#333',
      textDecoration: 'none',
      padding: '0.7rem 1.2rem',
      borderRadius: '8px',
      border: '2px solid #dee2e6',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    quickNavActive: {
      background: '#4a7c2a',
      color: 'white',
      borderColor: '#4a7c2a',
    },
    nav: {
      display: 'flex',
      justifyContent: 'center',
      background: 'white',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexWrap: 'wrap',
      gap: '1rem',
      width: '100%',
    },
    navLink: {
      textDecoration: 'none',
      color: '#666',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      fontSize: 'clamp(0.8rem, 2vw, 1rem)',
    },
    navLinkActive: {
      background: '#4a7c2a',
      color: 'white',
    },
    dashboard: {
      width: '100%',
      margin: '0 auto',
      padding: '1rem',
      maxWidth: '100%',
    },
    filterSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '1rem',
      width: '100%',
    },
    filterTitle: {
      margin: 0,
      color: '#2d5016',
      fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
    },
    toggleFiltersBtn: {
      background: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      whiteSpace: 'nowrap',
    },
    searchContainer: {
      marginBottom: '1rem',
      width: '100%',
    },
    searchInput: {
      width: '100%',
      padding: '0.8rem',
      border: '2px solid #ddd',
      borderRadius: '8px',
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      boxSizing: 'border-box',
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
      width: '100%',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    filterLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      color: '#333',
    },
    filterSelect: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      boxSizing: 'border-box',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginTop: '1rem',
      width: '100%',
    },
    featureGroup: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    featureButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      width: '100%',
    },
    featureButton: {
      background: '#f8f9fa',
      color: '#333',
      border: '1px solid #ddd',
      padding: '0.3rem 0.6rem',
      borderRadius: '15px',
      cursor: 'pointer',
      fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
    },
    featureButtonActive: {
      background: '#4a7c2a',
      color: 'white',
    },
    filterFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      flexWrap: 'wrap',
      gap: '1rem',
      width: '100%',
    },
    resultCount: {
      color: '#666',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    },
    clearFiltersBtn: {
      background: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      whiteSpace: 'nowrap',
    },
    accommodationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
      gap: '1.5rem',
      width: '100%',
    },
    accommodationCard: {
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      width: '100%',
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #4a7c2a, #2d5016)',
      height: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: 'clamp(2rem, 6vw, 3rem)',
      width: '100%',
    },
    cardContent: {
      padding: '1.5rem',
      width: '100%',
    },
    cardHeaderRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
      gap: '0.5rem',
      width: '100%',
    },
    cardTitle: {
      margin: 0,
      color: '#2d5016',
      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
      lineHeight: 1.3,
      flex: 1,
    },
    priceBadge: {
      background: '#4a7c2a',
      color: 'white',
      padding: '0.3rem 0.6rem',
      borderRadius: '12px',
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      flexWrap: 'wrap',
      gap: '0.5rem',
      width: '100%',
    },
    typeText: {
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    },
    starRating: {
      color: '#ffc107',
      fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
    },
    guestRating: {
      color: '#666',
      fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
    },
    description: {
      color: '#666',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      marginBottom: '1rem',
      lineHeight: 1.4,
      width: '100%',
    },
    locationInfo: {
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      color: '#666',
      width: '100%',
    },
    locationRow: {
      marginBottom: '0.3rem',
    },
    badgesContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap',
      width: '100%',
    },
    badgeWomen: {
      background: '#e83e8c',
      color: 'white',
      padding: '0.2rem 0.5rem',
      borderRadius: '10px',
      fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
      whiteSpace: 'nowrap',
    },
    badgeEco: {
      background: '#20c997',
      color: 'white',
      padding: '0.2rem 0.5rem',
      borderRadius: '10px',
      fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
      whiteSpace: 'nowrap',
    },
    badgeFamily: {
      background: '#fd7e14',
      color: 'white',
      padding: '0.2rem 0.5rem',
      borderRadius: '10px',
      fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
      whiteSpace: 'nowrap',
    },
    noResults: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: '#666',
      width: '100%',
    },
    showAllBtn: {
      background: '#4a7c2a',
      color: 'white',
      border: 'none',
      padding: '0.7rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '1rem',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    },
    modalOverlay: {
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
      padding: '1rem',
      width: '100vw',
      height: '100vh',
    },
    modal: {
      background: 'white',
      borderRadius: '12px',
      maxWidth: '90vw',
      width: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
    },
    modalCloseBtn: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '2rem',
      height: '2rem',
      cursor: 'pointer',
      zIndex: 1001,
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      padding: '1.5rem',
      width: '100%',
    },
    modalTitle: {
      color: '#2d5016',
      marginBottom: '1rem',
      fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    },
    modalDescription: {
      marginBottom: '1.5rem',
      lineHeight: 1.5,
      width: '100%',
    },
    modalDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginTop: '1.5rem',
      width: '100%',
    },
    modalColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    modalSubtitle: {
      margin: '0 0 0.5rem 0',
      color: '#2d5016',
      fontSize: 'clamp(1rem, 3vw, 1.1rem)',
    },
    modalAmenities: {
      marginTop: '1.5rem',
      width: '100%',
    },
    modalActions: {
      marginTop: '1.5rem',
      width: '100%',
    },
    websiteBtn: {
      background: '#4a7c2a',
      color: 'white',
      padding: '0.8rem 1.5rem',
      borderRadius: '5px',
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    },
  };

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
      <div style={styles.loadingContainer}>
        <h2>Loading accommodations...</h2>
        <p>Discovering the best places to stay in Kruger Park</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🏨 Kruger Park Accommodations</h1>
        <p style={styles.headerSubtitle}>Find your perfect stay near Kruger National Park</p>
      </header>

      {/* Quick Navigation Buttons */}
      <div style={styles.quickNav}>
        <Link to="/" style={styles.quickNavButton}>
          ← Back to Dashboard
        </Link>
        <Link to="/wildlife" style={styles.quickNavButton}>
          🐘 Wildlife Sightings
        </Link>
        <Link to="/accommodations" style={{...styles.quickNavButton, ...styles.quickNavActive}}>
          🏨 Accommodations
        </Link>
        <Link to="/tourism" style={styles.quickNavButton}>
          🌄 Tourism
        </Link>
      </div>

    
      <div style={styles.dashboard}>
        {/* Search and Filter Section */}
        <div style={styles.filterSection}>
          <div style={styles.filterHeader}>
            <h3 style={styles.filterTitle}>🔍 Find Your Perfect Stay</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={styles.toggleFiltersBtn}
            >
              {showFilters ? '🙈 Hide Filters' : '🔍 Show Filters'}
            </button>
          </div>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search accommodations by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <>
              <div style={styles.filtersGrid}>
                {/* Type Filter */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Accommodation Type:</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    style={styles.filterSelect}
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
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Minimum Rating:</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4★ & above</option>
                    <option value="4.5">4.5★ & above</option>
                    <option value="5">5★ only</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Max Price:</label>
                  <select
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="">Any Price</option>
                    <option value="$">$ Budget</option>
                    <option value="$$">$$ Moderate</option>
                    <option value="$$$">$$$ Luxury</option>
                    <option value="$$$$">$$$$ Premium</option>
                  </select>
                </div>

                {/* Gate Proximity */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Near Gate:</label>
                  <select
                    value={filters.gateProximity}
                    onChange={(e) => handleFilterChange('gateProximity', e.target.value)}
                    style={styles.filterSelect}
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

              {/* Amenities and Special Features */}
              <div style={{
                ...styles.featuresGrid,
                ...(window.innerWidth >= 768 && { gridTemplateColumns: '1fr 1fr' })
              }}>
                {/* Amenities */}
                <div style={styles.featureGroup}>
                  <label style={styles.filterLabel}>Amenities:</label>
                  <div style={styles.featureButtons}>
                    {['pool', 'spa', 'wifi', 'restaurant', 'bar', 'safari'].map(amenity => (
                      <button
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        style={{
                          ...styles.featureButton,
                          ...(filters.amenities.includes(amenity) ? styles.featureButtonActive : {})
                        }}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Features */}
                <div style={styles.featureGroup}>
                  <label style={styles.filterLabel}>Special Features:</label>
                  <div style={styles.featureButtons}>
                    {[
                      { value: 'women_owned', label: '♀ Women-Owned' },
                      { value: 'eco_friendly', label: '🌿 Eco-Friendly' },
                      { value: 'family_friendly', label: '👨‍👩‍👧‍👦 Family-Friendly' }
                    ].map(feature => (
                      <button
                        key={feature.value}
                        onClick={() => handleSpecialFeatureToggle(feature.value)}
                        style={{
                          ...styles.featureButton,
                          ...(filters.specialFeatures.includes(feature.value) ? styles.featureButtonActive : {})
                        }}
                      >
                        {feature.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Filter Summary and Actions */}
          <div style={styles.filterFooter}>
            <span style={styles.resultCount}>
              Showing {filteredAccommodations.length} of {accommodations.length} accommodations
            </span>
            <button 
              onClick={clearFilters}
              style={styles.clearFiltersBtn}
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>

        {/* Accommodations Grid */}
        <div style={styles.accommodationsGrid}>
          {filteredAccommodations.map(accommodation => (
            <div
              key={accommodation.id}
              style={styles.accommodationCard}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => setSelectedAccommodation(accommodation)}
            >
              {/* Header with image placeholder */}
              <div style={styles.cardHeader}>
                {getAccommodationIcon(accommodation.type)}
              </div>

              {/* Content */}
              <div style={styles.cardContent}>
                <div style={styles.cardHeaderRow}>
                  <h3 style={styles.cardTitle}>{accommodation.name}</h3>
                  <span style={styles.priceBadge}>
                    {getPriceRangeText(accommodation.price_range)}
                  </span>
                </div>

                <div style={styles.ratingRow}>
                  <span style={styles.typeText}>{accommodation.type}</span>
                  <span style={styles.starRating}>
                    {getStarRating(accommodation.star_rating)}
                  </span>
                  <span style={styles.guestRating}>
                    ({accommodation.guest_rating}/5)
                  </span>
                </div>

                <p style={styles.description}>
                  {accommodation.description}
                </p>

                <div style={styles.locationInfo}>
                  <div style={styles.locationRow}>
                    <strong>📍 Location:</strong> {accommodation.location}
                  </div>
                  <div style={styles.locationRow}>
                    <strong>🚪 Near:</strong> {accommodation.proximity_to_gates}
                  </div>
                </div>

                {/* Special badges */}
                <div style={styles.badgesContainer}>
                  {accommodation.is_women_owned && (
                    <span style={styles.badgeWomen}>
                      ♀ Women-Owned
                    </span>
                  )}
                  {accommodation.is_eco_friendly && (
                    <span style={styles.badgeEco}>
                      🌿 Eco-Friendly
                    </span>
                  )}
                  {accommodation.is_family_friendly && (
                    <span style={styles.badgeFamily}>
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
          <div style={styles.noResults}>
            <h3>No accommodations found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button 
              onClick={clearFilters}
              style={styles.showAllBtn}
            >
              Show All Accommodations
            </button>
          </div>
        )}
      </div>

      {/* Accommodation Detail Modal */}
      {selectedAccommodation && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button
              onClick={() => setSelectedAccommodation(null)}
              style={styles.modalCloseBtn}
            >
              ✕
            </button>
            
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>{selectedAccommodation.name}</h2>
              <p style={styles.modalDescription}>{selectedAccommodation.description}</p>
              
              <div style={{
                ...styles.modalDetails,
                ...(window.innerWidth >= 480 && { gridTemplateColumns: '1fr 1fr' })
              }}>
                <div style={styles.modalColumn}>
                  <h4 style={styles.modalSubtitle}>Details</h4>
                  <p><strong>Type:</strong> {selectedAccommodation.type}</p>
                  <p><strong>Star Rating:</strong> {getStarRating(selectedAccommodation.star_rating)}</p>
                  <p><strong>Guest Rating:</strong> {selectedAccommodation.guest_rating}/5</p>
                  <p><strong>Price:</strong> {getPriceRangeText(selectedAccommodation.price_range)}</p>
                </div>
                <div style={styles.modalColumn}>
                  <h4 style={styles.modalSubtitle}>Location</h4>
                  <p><strong>Area:</strong> {selectedAccommodation.location}</p>
                  <p><strong>Near Gates:</strong> {selectedAccommodation.proximity_to_gates}</p>
                  <p><strong>Contact:</strong> {selectedAccommodation.contact_info}</p>
                </div>
              </div>

              <div style={styles.modalAmenities}>
                <h4 style={styles.modalSubtitle}>Amenities</h4>
                <p>{selectedAccommodation.amenities}</p>
              </div>

              <div style={styles.modalActions}>
                <a 
                  href={selectedAccommodation.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.websiteBtn}
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