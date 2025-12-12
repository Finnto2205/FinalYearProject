import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = onLogin(formData.userName, formData.password);
    
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
    <div className="loginContainer">
      <div className="loginCard">
        <div className="loginHeader">
          <h1>Rota Management</h1>
          <p>Employee Scheduling System</p>
        </div>

        <form onSubmit={handleSubmit} className="loginForm">
          {error && (
            <div className="errorMessage">
              <span>{error}</span>
            </div>
          )}

          <div className="formGroup">
            <label htmlFor="userName">userName or Email</label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="formGroup">
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
            className="loginButton"
          >
            Login
          </button>
        </form>

        <div className="loginFooter">
          <div className="credentials">
            <h4>Demo Credentials:</h4>
            <div className="credentialsList">
              <div className="info">
                <strong>Admin:</strong>
                <span>userName: admin | Password: admin123</span>
              </div>
              <div className="info">
                <strong>User:</strong>
                <span>userName: user | Password: user123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
