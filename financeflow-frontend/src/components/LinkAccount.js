// src/components/LinkAccount.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import usePlaidLinkFlow from '../hooks/usePlaidLinkFlow'; // Import the custom hook
import './LinkAccount.css'; // Ensure this CSS file exists

const LinkAccount = () => {
  const { userID, token } = useAuth();
  const navigate = useNavigate();

  // Fetch Link Token
  const { data: linkTokenData, loading: linkTokenLoading, error: linkTokenError } = useFetch(
    userID ? '/api/plaid/link-token' : '',
    userID
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          data: { userID },
        }
      : null
  );

  // Use the custom hook to handle Plaid Link flow
  useEffect(() => {
    if (!userID) {
      navigate('/login');
    }
  }, [userID, navigate]);

  usePlaidLinkFlow(
    linkTokenData?.link_token,
    token,
    userID,
    navigate
  );

  return (
    <div className="link-account-container">
      <h2>Link Your Bank Account</h2>
      {linkTokenLoading && <p>Loading link token...</p>}
      {linkTokenError && <p className="error-message">{linkTokenError}</p>}
      {/* Plaid Link flow is handled by the custom hook */}
    </div>
  );
};

export default LinkAccount;
