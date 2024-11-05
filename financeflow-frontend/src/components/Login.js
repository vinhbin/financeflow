// src/components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext'; // Named import
import Spinner from './Spinner'; // Import the Spinner component
import './Auth.css'; // Import the shared CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Destructure login from context

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset message on new login attempt
    setIsLoading(true); // Start loading
    console.log('Attempting login with:', { email, password }); // Debugging log

    try {
      // Make a POST request to the backend API
      const response = await api.post('/api/users/login', { email, password });
      console.log('Login response:', response.data); // Debugging log

      // Use the login function from context to update auth state
      console.log('Using context login function.');
      login(response.data.token, response.data.userID, response.data.name); // Pass name instead of email

      // Set success message
      setMessage('Login successful! Redirecting to dashboard...');

      // Wait for 1 second before navigating
      setTimeout(() => {
        console.log('Navigating to dashboard.');
        navigate('/dashboard');
        console.log('Navigation to dashboard triggered.');
        setIsLoading(false); // End loading after navigation
      }, 1000); // 1000 milliseconds = 1 second
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false); // End loading on error
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
            {/* Display email error */}
            {/* {errors.email && <div className="error-message">{errors.email}</div>} */}
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
            {/*
            {errors.password && <div className="error-message">{errors.password}</div>}
            */}
          </div>
          <button type="submit" className="glass-button" disabled={isLoading}>
            Login
          </button>
        </form>

        {/* Display success or error message */}
        {message && <p>{message}</p>}

        {/* Display spinner during loading */}
        {isLoading && <Spinner />}

        {/* Register Section */}
        <p>
          <span className="switch-text">Don't have an account?</span>
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
