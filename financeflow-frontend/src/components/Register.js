// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import api from '../utils/api'; // Import the axios instance for API calls
import Spinner from './Spinner'; // Import the Spinner component
import './Auth.css'; // Use the shared CSS

const Register = () => {
  const [name, setName] = useState(''); // State for storing name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize navigate

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true); // Start loading

    console.log('Registering with:', { name, email, password }); // Debugging log

    // Define the endpoint as a constant and trim any accidental whitespace/newline
    const endpoint = '/api/users/register'.trim();
    console.log('Registration endpoint:', endpoint); // Debugging log

    try {
      // Send name, email, and password to the backend
      const response = await api.post(endpoint, { name, email, password });
      console.log('Registration successful:', response.data);
      setMessage('Registration successful! Redirecting to login...');

      // Wait for 1 second before navigating
      setTimeout(() => {
        console.log('Navigating to login.');
        navigate('/login');
        console.log('Navigation to login triggered.');
        setIsLoading(false); // End loading after navigation
      }, 1000); // 1000 milliseconds = 1 second
    } catch (error) {
      console.error('Error registering:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.error || 'Registration failed. Please try again.');
      setIsLoading(false); // End loading on error
    }
  };

  return (
    <div className="auth-container">
      {/* Content */}
      <h1 className="auth-title">FinanceFlow</h1>
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="name">Name</label> {/* Linked label for accessibility */}
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First, Last Name"
              required
            />
            {/* Display name error */}
            {/* {errors.name && <div className="error-message">{errors.name}</div>} */}
          </div>
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
            {/* Display password error */}
            {/* {errors.password && <div className="error-message">{errors.password}</div>} */}
          </div>
          <button type="submit" className="glass-button" disabled={isLoading}>Register</button>
        </form>

        {/* Display success or error message */}
        {message && <p>{message}</p>}

        {/* Display spinner during loading */}
        {isLoading && <Spinner />}

        {/* Switch Section */}
        <p>
          <span className="switch-text">Already have an account?</span>
          <span 
            className="switch-link" 
            onClick={() => navigate('/login')}
            role="button" 
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/login');
              }
            }}
          >
            Login Here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
