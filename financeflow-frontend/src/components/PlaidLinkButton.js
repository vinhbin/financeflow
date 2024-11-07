// src/components/PlaidLinkButton.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePlaidLink } from 'react-plaid-link';
import useAuth from '../hooks/useAuth';
import { API_BASE_URL } from '../config'; // Ensure you have this configured
import './PlaidLinkButton.css'; // Import the CSS file

const PlaidLinkButton = ({ onSuccessCallback }) => {
  const [linkToken, setLinkToken] = useState(null);
  const { token, userID } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to create link token
    const createLinkToken = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/plaid/link-token`,
          { userID },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLinkToken(response.data.link_token);
      } catch (err) {
        console.error('Error creating link token:', err.response?.data || err.message);
        setError('Failed to create link token. Please try again.');
      }
    };

    if (token && userID) {
      createLinkToken();
    }
  }, [token, userID]);

  const onSuccess = async (public_token, metadata) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/plaid/exchange-token`,
        { public_token, userID },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Bank account linked successfully:', response.data);
      
      setError(null);
      if (onSuccessCallback) {
        onSuccessCallback(); // Trigger the callback to refresh accounts
      }
    } catch (err) {
      console.error('Error exchanging public token:', err.response?.data || err.message);
      setError('Failed to link bank account. Please try again.');
    }
  };

  const onExit = (error, metadata) => {
    if (error) {
      console.error('Plaid Link exited with error:', error);
      setError('Plaid Link encountered an error. Please try again.');
    }
    // Optionally, handle user exiting the Plaid Link flow without completing
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      {linkToken ? (
        <button
          onClick={() => open()}
          disabled={!ready}
          className="glass-button plaid-link-button" // Apply both classes
        >
          Connect Bank Account
        </button>
      ) : (
        <p>Loading Plaid Link...</p>
      )}
    </div>
  );
};

export default PlaidLinkButton;
