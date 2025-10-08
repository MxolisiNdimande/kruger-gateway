// frontend/src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <Link to="/">
          <h2>Kruger Gateway Discoveries</h2>
        </Link>
      </div>
      <div className="nav-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/wildlife" 
          className={location.pathname === '/wildlife' ? 'active' : ''}
        >
          Wildlife
        </Link>
        <Link 
          to="/accommodations" 
          className={location.pathname === '/accommodations' ? 'active' : ''}
        >
          Accommodations
        </Link>
        <Link 
          to="/tourism" 
          className={location.pathname === '/tourism' ? 'active' : ''}
        >
          Mpumalanga Tourism
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;