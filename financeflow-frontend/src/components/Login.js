// src/components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner'; // Optional: Spinner component for loading state
import './Auth.css'; // Reuse the existing Auth styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    console.log('Attempting login with:', { email, password });

    try {
      const response = await api.post('/api/users/login', { email, password });
      console.log('Login response:', response.data);

      if (!response.data.userID) {
        console.error('userID is missing in the login response.');
        setMessage('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      login(response.data.token, response.data.userID, response.data.name);

      setMessage('Login successful! Redirecting to dashboard...');

      setTimeout(() => {
        console.log('Navigating to dashboard.');
        navigate('/dashboard');
        console.log('Navigation to dashboard triggered.');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      {/* Content */}
      <h1 className="auth-title">FinanceFlow</h1>
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label> {/* Linked label for accessibility */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label> {/* Linked label for accessibility */}
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="glass-button" disabled={isLoading}>
            Login
          </button>
        </form>

        {/* Display success or error message */}
        {message && <p>{message}</p>}

        {/* Display spinner during loading */}
        {isLoading && <Spinner />}

        {/* Combined Links: Reset Password | Register Here */}
        <p className="auth-links">
          <span
            className="switch-link"
            onClick={() => navigate('/reset-password')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/reset-password');
              }
            }}
          >
            Reset Password
          </span>
          {' | '}
          <span
            className="switch-link"
            onClick={() => navigate('/register')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/register');
              }
            }}
          >
            Register Here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
