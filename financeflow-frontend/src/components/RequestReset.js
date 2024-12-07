import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Spinner from './Spinner'; // Optional: Spinner component for loading state
import './Auth.css'; // Reuse the existing Auth styles

const RequestReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/users/request-reset', { email });
      setMessage(response.data.message);
      setIsLoading(false);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setMessage(error.response?.data?.message || 'Failed to request password reset. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">FinanceFlow</h1>
      <div className="auth-form">
        <h2>Request Password Reset</h2>
        <form onSubmit={handleRequestReset}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <button type="submit" className="glass-button" disabled={isLoading}>
            Send Reset Link
          </button>
          {isLoading && <Spinner />} {/* Spinner rendered below the button */}
        </form>

        {message && <p>{message}</p>}

        <p>
          <span className="switch-text">Remembered your password?</span>
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

export default RequestReset;
