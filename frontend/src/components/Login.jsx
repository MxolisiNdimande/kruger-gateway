import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      setMessage('✅ Login successful! Redirecting...');
      
      // Redirect based on role
      setTimeout(() => {
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/ranger/dashboard');
        }
      }, 1500);

    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 Kruger Park Login</h2>
        <p className="login-subtitle">Access the Wildlife Management System</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="Enter your email"
              className="login-input"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="Enter your password"
              className="login-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? '🔐 Logging in...' : '🚪 Login'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>
          <div className="account-list">
            <div className="account-item">
              <strong>Admin:</strong> admin@krugerpark.co.za / admin123
            </div>
            <div className="account-item">
              <strong>Ranger:</strong> ranger@krugerpark.co.za / ranger123
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Contact administrator</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;