import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { usePlaidLink } from 'react-plaid-link';

const PlaidLinkButton = ({ userID }) => {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/plaid/link-token`, { userID });
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
      }
    };

    createLinkToken();
  }, [userID]);

  const onSuccess = (public_token) => {
    axios.post(`${API_BASE_URL}/api/plaid/exchange-token`, { public_token, userID })
      .then(response => {
        console.log('Successfully linked bank account:', response.data);
      })
      .catch(error => {
        console.error('Error exchanging public token:', error);
      });
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <div>
      {linkToken ? (
        <button onClick={() => open()} disabled={!ready}>
          Connect to Bank
        </button>
      ) : (
        <p>Loading Plaid Link...</p>
      )}
    </div>
  );
};

export default PlaidLinkButton;

