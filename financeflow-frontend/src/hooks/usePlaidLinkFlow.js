// src/hooks/usePlaidLinkFlow.js
import { usePlaidLink } from 'react-plaid-link';
import { useEffect } from 'react';
import axios from 'axios';

const usePlaidLinkFlow = (linkToken, token, userID, navigate) => {
  const handleOnSuccess = async (public_token, metadata) => {
    // Exchange public_token for access_token
    try {
      const response = await axios.post(
        '/api/plaid/exchange-token',
        { public_token, userID },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === 'Bank account linked successfully') {
        navigate('/dashboard'); // Redirect to dashboard after successful linking
      } else {
        console.error('Unexpected response:', response.data);
      }
    } catch (error) {
      console.error('Error exchanging public token:', error.response?.data || error.message);
      // Optionally, display an error message to the user
    }
  };

  const handleOnExit = (error, metadata) => {
    if (error) {
      console.error('Plaid Link exited with error:', error);
      // Optionally, display an error message to the user
    }
    // Optionally, navigate back to dashboard or display a message
    navigate('/dashboard');
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  // This hook does not return anything
};

export default usePlaidLinkFlow;
