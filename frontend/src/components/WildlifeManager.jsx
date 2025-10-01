import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const WildlifeManager = () => {
  const [sightings, setSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSighting, setEditingSighting] = useState(null);
  const [formData, setFormData] = useState({
    gate_id: '',
    animal_type: '',
    probability: 'medium',
    confidence: 'reported',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnimal, setFilterAnimal] = useState('');
  const [filterGate, setFilterGate] = useState('');
  const [filterProbability, setFilterProbability] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Test backend connection on component load
  useEffect(() => {
    checkBackendConnection();
    fetchData();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [sightings, searchTerm, filterAnimal, filterGate, filterProbability, sortBy]);

  const checkBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Backend connection successful:', response.data);
      setBackendStatus('connected');
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendStatus('disconnected');
      setMessage('❌ Backend server is not running. Please start it with: cd backend && npm run dev');
    }
  };

  const fetchData = async () => {
    try {
      setMessage('');
      const [sightingsRes, gatesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/wildlife/big-five-summary'),
        axios.get('http://localhost:5000/api/wildlife/gates')
      ]);
      setSightings(sightingsRes.data);
      setGates(gatesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setMessage('❌ Failed to load data from backend');
    }
  };

  const applyFilters = () => {
    let filtered = [...sightings];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(sighting =>
        sighting.animal_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sighting.gate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sighting.notes && sighting.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply animal filter
    if (filterAnimal) {
      filtered = filtered.filter(sighting => sighting.animal_type === filterAnimal);
    }

    // Apply gate filter
    if (filterGate) {
      filtered = filtered.filter(sighting => sighting.gate_name === filterGate);
    }

    // Apply probability filter
    if (filterProbability) {
      filtered = filtered.filter(sighting => sighting.probability === filterProbability);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'animal':
        filtered.sort((a, b) => a.animal_type.localeCompare(b.animal_type));
        break;
      case 'gate':
        filtered.sort((a, b) => a.gate_name.localeCompare(b.gate_name));
        break;
      case 'probability':
        const probOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => probOrder[b.probability] - probOrder[a.probability]);
        break;
      default:
        break;
    }

    setFilteredSightings(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.gate_id || !formData.animal_type) {
      setMessage('❌ Please select both a gate and an animal');
      return;
    }

    try {
      console.log('🔄 Frontend form data:', formData);
      
      // Transform field names to match backend expectations
      const backendData = {
        gateId: formData.gate_id,
        animalType: formData.animal_type,
        probability: formData.probability,
        confidence: formData.confidence,
        notes: formData.notes
      };

      let response;
      if (editingSighting) {
        // Update existing sighting
        response = await axios.put(
          `http://localhost:5000/api/wildlife/sightings/${editingSighting.id}`,
          backendData
        );
      } else {
        // Create new sighting
        response = await axios.post(
          'http://localhost:5000/api/wildlife/sightings', 
          backendData
        );
      }
      
      console.log('✅ Response received:', response.data);
      
      // Reset form
      setFormData({
        gate_id: '',
        animal_type: '',
        probability: 'medium',
        confidence: 'reported',
        notes: ''
      });
      setShowForm(false);
      setEditingSighting(null);
      setMessage(editingSighting ? '✅ Sighting updated successfully!' : '✅ Sighting reported successfully!');
      
      // Refresh data
      await fetchData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Submission error details:', error);
      setMessage('❌ Error saving sighting: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (sighting) => {
    setEditingSighting(sighting);
    setFormData({
      gate_id: sighting.gate_id || '',
      animal_type: sighting.animal_type,
      probability: sighting.probability,
      confidence: sighting.confidence,
      notes: sighting.notes || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (sightingId) => {
    if (window.confirm('Are you sure you want to delete this sighting?')) {
      try {
        await axios.delete(`http://localhost:5000/api/wildlife/sightings/${sightingId}`);
        setMessage('✅ Sighting deleted successfully!');
        await fetchData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Error deleting sighting: ' + error.message);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAnimal('');
    setFilterGate('');
    setFilterProbability('');
    setSortBy('newest');
  };

  const exportToCSV = () => {
    const headers = ['Gate', 'Animal', 'Probability', 'Confidence', 'Notes', 'Reported'];
    const csvData = filteredSightings.map(sighting => [
      sighting.gate_name,
      sighting.animal_type,
      sighting.probability,
      sighting.confidence,
      sighting.notes || '',
      new Date(sighting.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kruger-sightings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setMessage('✅ Data exported to CSV successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getAnimalEmoji = (animal) => {
    const emojis = {
      lion: '🦁',
      elephant: '🐘',
      leopard: '🐆',
      rhino: '🦏',
      buffalo: '🐃'
    };
    return emojis[animal] || '🐾';
  };

  const getStats = () => {
    const total = filteredSightings.length;
    const byAnimal = filteredSightings.reduce((acc, sighting) => {
      acc[sighting.animal_type] = (acc[sighting.animal_type] || 0) + 1;
      return acc;
    }, {});
    const byProbability = filteredSightings.reduce((acc, sighting) => {
      acc[sighting.probability] = (acc[sighting.probability] || 0) + 1;
      return acc;
    }, {});

    return { total, byAnimal, byProbability };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading wildlife data...</h2>
        <p>Checking backend connection...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <h1>🐘 Enhanced Wildlife Manager</h1>
        <p>Advanced wildlife sightings management system</p>
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.9rem',
          opacity: 0.8 
        }}>
          Backend Status: 
          <span style={{ 
            color: backendStatus === 'connected' ? '#4CAF50' : '#f44336',
            fontWeight: 'bold',
            marginLeft: '0.5rem'
          }}>
            {backendStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
      </header>

      <nav className="nav">
        <Link to="/">📊 Dashboard</Link>
        <Link to="/wildlife" className="active">🐘 Wildlife Manager</Link>
      </nav>

      <div className="dashboard">
        {/* Message Display */}
        {message && (
          <div style={{
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            padding: '1rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4a7c2a, #2d5016)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
            <div>Total Sightings</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #2196F3, #0D47A1)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Object.keys(stats.byAnimal).length}</div>
            <div>Animal Species</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #FF9800, #E65100)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{gates.length}</div>
            <div>Park Gates</div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>🔍 Search & Filter</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={clearFilters} style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                🗑️ Clear Filters
              </button>
              <button onClick={exportToCSV} style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                📊 Export CSV
              </button>
              <button 
                onClick={() => setShowForm(!showForm)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {showForm ? '✖ Cancel' : '➕ New Sighting'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search gates, animals, notes..."
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Animal:</label>
              <select
                value={filterAnimal}
                onChange={(e) => setFilterAnimal(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="">All Animals</option>
                <option value="lion">🦁 Lion</option>
                <option value="elephant">🐘 Elephant</option>
                <option value="leopard">🐆 Leopard</option>
                <option value="rhino">🦏 Rhino</option>
                <option value="buffalo">🐃 Buffalo</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Gate:</label>
              <select
                value={filterGate}
                onChange={(e) => setFilterGate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="">All Gates</option>
                {gates.map(gate => (
                  <option key={gate.id} value={gate.gate_name}>{gate.gate_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="animal">Animal A-Z</option>
                <option value="gate">Gate A-Z</option>
                <option value="probability">Probability</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Showing {filteredSightings.length} of {sightings.length} sightings
            {(filterAnimal || filterGate || searchTerm) && (
              <span> • 
                {filterAnimal && ` Animal: ${filterAnimal}`}
                {filterGate && ` Gate: ${filterGate}`}
                {searchTerm && ` Search: "${searchTerm}"`}
              </span>
            )}
          </div>
        </div>

        {/* Add/Edit Sighting Form */}
        {showForm && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            border: '2px solid #e0e0e0'
          }}>
            <h3 style={{ color: '#2d5016', marginBottom: '1.5rem' }}>
              {editingSighting ? '✏️ Edit Wildlife Sighting' : '📝 Report New Wildlife Sighting'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>🚪 Park Gate: *</label>
                  <select 
                    value={formData.gate_id}
                    onChange={(e) => setFormData({...formData, gate_id: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #ddd', borderRadius: '5px' }}
                  >
                    <option value="">-- Select a gate --</option>
                    {gates.map(gate => (
                      <option key={gate.id} value={gate.id}>{gate.gate_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>🐾 Animal: *</label>
                  <select 
                    value={formData.animal_type}
                    onChange={(e) => setFormData({...formData, animal_type: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #ddd', borderRadius: '5px' }}
                  >
                    <option value="">-- Select an animal --</option>
                    <option value="lion">🦁 Lion</option>
                    <option value="elephant">🐘 Elephant</option>
                    <option value="leopard">🐆 Leopard</option>
                    <option value="rhino">🦏 Rhino</option>
                    <option value="buffalo">🐃 Buffalo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>📊 Probability:</label>
                  <select 
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #ddd', borderRadius: '5px' }}
                  >
                    <option value="high">High 🟢</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="low">Low 🔴</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>✅ Confidence:</label>
                  <select 
                    value={formData.confidence}
                    onChange={(e) => setFormData({...formData, confidence: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #ddd', borderRadius: '5px' }}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="reported">Reported</option>
                    <option value="suspected">Suspected</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>📝 Notes:</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Describe the sighting (location, behavior, time, number of animals, etc.)"
                  style={{ width: '100%', padding: '0.8rem', border: '2px solid #ddd', borderRadius: '5px', minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {editingSighting ? '💾 Update Sighting' : '📋 Submit Sighting'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingSighting(null); }} style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Enhanced Sightings Table */}
        <div className="table-container">
          <div style={{ padding: '1rem', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>📋 Wildlife Sightings</h3>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Showing {filteredSightings.length} of {sightings.length} sightings
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Gate</th>
                <th>Animal</th>
                <th>Probability</th>
                <th>Confidence</th>
                <th>Notes</th>
                <th>Reported</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSightings.length > 0 ? (
                filteredSightings.map(sighting => (
                  <tr key={sighting.id}>
                    <td><strong>{sighting.gate_name}</strong></td>
                    <td>
                      <span style={{ fontSize: '1.4rem', marginRight: '0.5rem' }}>
                        {getAnimalEmoji(sighting.animal_type)}
                      </span>
                      {sighting.animal_type.toUpperCase()}
                    </td>
                    <td>
                      <span className={`badge badge-${sighting.probability}`}>
                        {sighting.probability.toUpperCase()}
                      </span>
                    </td>
                    <td>{sighting.confidence}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.9rem' }}>
                      {sighting.notes || '-'}
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#666' }}>
                      {new Date(sighting.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(sighting)}
                          style={{
                            background: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Edit sighting"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(sighting.id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Delete sighting"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    {sightings.length === 0 ? 'No wildlife sightings found.' : 'No sightings match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WildlifeManager;