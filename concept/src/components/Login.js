import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = onLogin(formData.username, formData.password);
    
    if (!success) {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Rota Management</h1>
          <p>Employee Scheduling System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
          >
            Login
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <div className="credentials-list">
              <div className="credential-item">
                <strong>Admin:</strong>
                <span>Username: admin | Password: admin123</span>
              </div>
              <div className="credential-item">
                <strong>User:</strong>
                <span>Username: user | Password: user123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
