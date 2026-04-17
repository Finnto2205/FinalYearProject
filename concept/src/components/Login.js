import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const success = await onLogin(formData.userName, formData.password);

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
    <div className="loginContainer d-flex align-items-center justify-content-center min-vh-100">
      <div className="loginCard card shadow-sm p-4" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="loginHeader mb-4 text-center">
          <h1>Rota Management</h1>
          <p className="text-muted">Employee Scheduling System</p>
        </div>

        <form onSubmit={handleSubmit} className="loginForm">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="userName" className="form-label">Username or Email</label>
            <input
              type="text"
              id="userName"
              name="userName"
              className="form-control"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="loginButton btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="loginFooter mt-4">
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
