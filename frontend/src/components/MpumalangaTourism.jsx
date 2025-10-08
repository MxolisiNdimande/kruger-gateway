import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MpumalangaTourism.css';

const MpumalangaTourism = () => {
    const [currentFilter, setCurrentFilter] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState(null);

    // Tourism Data - you can move this to a separate file later
    const tourismData = {
        destinations: [
            {
                id: 1,
                name: "Kruger National Park",
                type: "kruger",
                description: "World-renowned safari destination with incredible biodiversity and Big Five sightings.",
                image: "/assets/kruger-park.jpg",
                tags: ["Safari", "Wildlife", "Big Five"],
                rating: 4.9,
                gates: ["Malelane", "Phabeni", "Numbi", "Paul Kruger"],
                featured: true,
                details: {
                    bestTime: "May to September",
                    activities: ["Game Drives", "Bird Watching", "Bush Walks"],
                    entryFee: "ZAR 400 per person"
                }
            },
            {
                id: 2,
                name: "God's Window",
                type: "panorama",
                description: "Breathtaking viewpoint offering panoramic vistas of the Lowveld.",
                image: "/assets/gods-window.jpg",
                tags: ["Viewpoint", "Scenic", "Photography"],
                rating: 4.7,
                featured: true
            },
            {
                id: 3,
                name: "Blyde River Canyon",
                type: "panorama",
                description: "One of the largest canyons in the world with dramatic scenery.",
                image: "/assets/blyde-canyon.jpg",
                tags: ["Canyon", "Scenic", "Boat Trips"],
                rating: 4.8
            },
            {
                id: 4,
                name: "Shangana Cultural Village",
                type: "cultural",
                description: "Authentic cultural experience showcasing Shangaan traditions.",
                image: "/assets/shangana.jpg",
                tags: ["Cultural", "Traditional", "Educational"],
                rating: 4.5,
                womenOwned: true
            }
        ],
        activities: [
            {
                id: 1,
                name: "Spring Wildflower Tours",
                description: "Guided tours to see Mpumalanga's spectacular spring wildflower displays.",
                image: "/assets/wildflowers.jpg",
                tags: ["Seasonal", "Nature", "Photography"],
                duration: "3-4 hours",
                season: "spring",
                price: "From ZAR 350"
            },
            {
                id: 2,
                name: "Hot Air Balloon Safari",
                description: "Experience the African sunrise from above on a breathtaking balloon ride.",
                image: "/assets/balloon-safari.jpg",
                tags: ["Adventure", "Scenic", "Sunrise"],
                duration: "3 hours",
                season: "all",
                price: "From ZAR 1200"
            }
        ],
        businesses: [
            {
                id: 1,
                name: "Safari Queen Tours",
                description: "Women-led safari company offering personalized game drives.",
                image: "/assets/safari-queen.jpg",
                tags: ["Tours", "Safari", "Women-Owned"],
                rating: 4.9,
                location: "Hazyview",
                contact: "+27 82 123 4567"
            }
        ]
    };

    const filteredDestinations = currentFilter === 'all' 
        ? tourismData.destinations 
        : tourismData.destinations.filter(dest => dest.type === currentFilter);

    const openModal = (modalType, data = null) => {
        setActiveModal(modalType);
        setModalData(data);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    const addToItinerary = (item) => {
        setSelectedItems(prev => [...prev, item]);
        // You can integrate with your existing notification system
        console.log(`${item.name} added to itinerary!`);
    };

    const generateStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
    };

    return (
        <div className="mpumalanga-tourism">
            {/* Hero Section */}
            <section className="tourism-hero">
                <div className="hero-content">
                    <h1>Discover Mpumalanga</h1>
                    <p>Your gateway to wildlife, scenery, and cultural experiences</p>
                    <button 
                        className="cta-button"
                        onClick={() => openModal('itinerary')}
                    >
                        Build My Itinerary
                    </button>
                </div>
            </section>

            {/* Quick Navigation Buttons */}
            <div className="quick-nav">
                <Link to="/" className="quick-nav-button">
                    ← Back to Dashboard
                </Link>
                <Link to="/wildlife" className="quick-nav-button">
                    🐘 Wildlife Sightings
                </Link>
                <Link to="/accommodations" className="quick-nav-button">
                    🏨 Accommodations
                </Link>
                <Link to="/tourism" className="quick-nav-button active">
                    🌄 Tourism
                </Link>
            </div>

            {/* Seasonal Banner */}
            <div className="seasonal-banner">
                <i className="fas fa-seedling"></i>
                <span>Spring Special: September to November - Book your seasonal adventures!</span>
            </div>

            {/* Destinations Section */}
            <section className="tourism-section">
                <div className="section-header">
                    <h2>Explore Mpumalanga</h2>
                    <p>From Kruger National Park to the Panorama Route</p>
                </div>

                <div className="filter-section">
                    <div className="filter-options">
                        {['all', 'kruger', 'panorama', 'cultural', 'adventure'].map(filter => (
                            <button
                                key={filter}
                                className={`filter-btn ${currentFilter === filter ? 'active' : ''}`}
                                onClick={() => setCurrentFilter(filter)}
                            >
                                {filter === 'all' ? 'All' : 
                                 filter === 'kruger' ? 'Kruger Park' :
                                 filter === 'panorama' ? 'Panorama Route' :
                                 filter === 'cultural' ? 'Cultural' : 'Adventure'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="cards-grid">
                    {filteredDestinations.map(destination => (
                        <div key={destination.id} className="tourism-card">
                            <div className="card-image">
                                <img src={destination.image} alt={destination.name} />
                                {destination.featured && <span className="featured-badge">Featured</span>}
                            </div>
                            <div className="card-content">
                                <h3>{destination.name}</h3>
                                <p>{destination.description}</p>
                                <div className="tags">
                                    {destination.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {destination.womenOwned && (
                                        <span className="tag women-owned">Women-Owned</span>
                                    )}
                                </div>
                                {destination.gates && (
                                    <div className="gate-info">
                                        <small>Gates: {destination.gates.slice(0, 2).join(', ')}</small>
                                    </div>
                                )}
                                <div className="card-footer">
                                    <div className="rating">
                                        {generateStars(destination.rating)} {destination.rating}
                                    </div>
                                    <div className="card-actions">
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => openModal('destination', destination)}
                                        >
                                            Details
                                        </button>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => addToItinerary(destination)}
                                        >
                                            Add to Trip
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Activities Section */}
            <section className="tourism-section activities-section">
                <div className="section-header">
                    <h2>Seasonal Activities</h2>
                    <p>Make the most of your Mpumalanga adventure</p>
                </div>

                <div className="cards-grid">
                    {tourismData.activities.map(activity => (
                        <div key={activity.id} className="tourism-card">
                            <div className="card-image">
                                <img src={activity.image} alt={activity.name} />
                                <span className="season-badge">{activity.season}</span>
                            </div>
                            <div className="card-content">
                                <h3>{activity.name}</h3>
                                <p>{activity.description}</p>
                                <div className="tags">
                                    {activity.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="activity-meta">
                                    <span>Duration: {activity.duration}</span>
                                    <span>{activity.price}</span>
                                </div>
                                <div className="card-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => addToItinerary(activity)}
                                    >
                                        Add to Itinerary
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modals */}
            {activeModal === 'destination' && modalData && (
                <DestinationModal 
                    destination={modalData}
                    onClose={closeModal}
                    onAddToItinerary={() => addToItinerary(modalData)}
                    generateStars={generateStars}
                />
            )}

            {activeModal === 'itinerary' && (
                <ItineraryModal 
                    selectedItems={selectedItems}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

// Modal Components
const DestinationModal = ({ destination, onClose, onAddToItinerary, generateStars }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>×</button>
            <div className="modal-header">
                <h2>{destination.name}</h2>
                <div className="rating">{generateStars(destination.rating)} {destination.rating}</div>
            </div>
            <img src={destination.image} alt={destination.name} className="modal-image" />
            <p>{destination.description}</p>
            
            {destination.details && (
                <div className="modal-details">
                    <div className="detail-item">
                        <strong>Best Time:</strong> {destination.details.bestTime}
                    </div>
                    <div className="detail-item">
                        <strong>Activities:</strong> {destination.details.activities.join(', ')}
                    </div>
                    <div className="detail-item">
                        <strong>Entry Fee:</strong> {destination.details.entryFee}
                    </div>
                </div>
            )}

            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>
                    Close
                </button>
                <button className="btn-primary" onClick={onAddToItinerary}>
                    Add to Itinerary
                </button>
            </div>
        </div>
    </div>
);

const ItineraryModal = ({ selectedItems, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>×</button>
            <h2>My Mpumalanga Itinerary</h2>
            
            {selectedItems.length === 0 ? (
                <p>No items added yet. Start by exploring destinations and activities!</p>
            ) : (
                <div className="itinerary-list">
                    {selectedItems.map((item, index) => (
                        <div key={index} className="itinerary-item">
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                            <button 
                                className="btn-danger"
                                onClick={() => {
                                    // Remove item logic would go here
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>
                    Close
                </button>
                {selectedItems.length > 0 && (
                    <button className="btn-primary">
                        Save Itinerary
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default MpumalangaTourism;