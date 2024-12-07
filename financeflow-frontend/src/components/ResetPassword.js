import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Spinner from './Spinner';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null); // null: not checked, true: valid, false: invalid
  const [isSuccess, setIsSuccess] = useState(false); // Track success state

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/users/verify-reset-token/${token}`);
        setIsValidToken(response.data.valid);
      } catch (error) {
        setIsValidToken(false);
        setMessage('This password reset link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(`/api/users/reset-password/${token}`, { newPassword });
      setMessage(response.data.message);
      setIsSuccess(true);
      setIsLoading(false);

      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isValidToken === false) {
    return (
      <div className="auth-container">
        <h1 className="auth-title">FinanceFlow</h1>
        <div className="auth-form">
          <h2>Password Reset</h2>
          <p>{message}</p>
          <button className="glass-button" onClick={() => navigate('/reset-password')}>
            Request a New Password Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">FinanceFlow</h1>
      <div className="auth-form">
        {isSuccess ? (
          <div>
            <h2>{message}</h2>
            <p>You will be redirected to the login page in 5 seconds...</p>
            <Spinner />
          </div>
        ) : (
          <>
            <h2>Set New Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button type="submit" className="glass-button">
                Reset Password
              </button>
            </form>
            {isLoading && <Spinner />}
            {message && <p>{message}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
