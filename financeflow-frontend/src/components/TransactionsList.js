// src/components/TransactionsList.js
import React, { useRef, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import './ScrollableContainer.css'; // Import the custom scrollbar styling

/**
 * TransactionsList Component
 * Displays a list of transactions for a given user.
 * After loading 6 or more transactions, the list becomes scrollable.
 * Additionally, it uses a custom scrollbar that appears on scroll and disappears after 1.5 seconds of inactivity.
 *
 * @param {number} userID - The ID of the user whose transactions to fetch.
 */
const TransactionsList = ({ userID }) => {
  // Fetch transactions data from backend
  // Note: Ensure your useFetch hook returns 'isLoading' (or 'loading') and 'error' similar to your main code.
  const { data: transactions, isLoading, error } = useFetch(`/api/plaid/transactions/${userID}`);

  // If needed, adapt the variable names if your hook returns different keys, e.g., loading -> isLoading
  // If the original code really uses 'loading' and not 'isLoading', just revert to 'loading'.
  // We'll assume the main code style (isLoading) for consistency:
  // If it's actually 'loading', just rename isLoading back to loading.

  // Handle loading and error states
  if (isLoading) return <p>Loading transactions...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // Ref for the scrollable container to manage custom scrollbar show/hide logic
  const tableContainerRef = useRef(null);

  useEffect(() => {
    let timeoutId;

    /**
     * Function: handleScroll
     * Triggered when the user scrolls the transaction list.
     * Adds 'scroll-active' class to show the scrollbar, and removes it after 1.5s of no scrolling.
     */
    const handleScroll = () => {
      const el = tableContainerRef.current;
      if (!el) return;

      // Add 'scroll-active' class on scroll
      el.classList.add('scroll-active');

      // Clear any previous timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Remove the class after 1.5 seconds of inactivity
      timeoutId = setTimeout(() => {
        el.classList.remove('scroll-active');
      }, 1500);
    };

    const el = tableContainerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      {/* Wrap the table in a scrollable container if more than 6 transactions */}
      {/* The scrollable-container class is defined in ScrollableContainer.css */}
      <div
        ref={tableContainerRef}
        className={`scrollable-container`}
        style={{
          maxHeight: transactions && transactions.length > 6 ? '350px' : 'auto',
          overflowY: transactions && transactions.length > 6 ? 'auto' : 'visible',
          marginTop: '10px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Description</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.map((transaction) => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <td style={{ padding: '10px' }}>{transaction.description}</td>
                <td style={{ padding: '10px' }}>${transaction.amount}</td>
                <td style={{ padding: '10px' }}>
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsList;
