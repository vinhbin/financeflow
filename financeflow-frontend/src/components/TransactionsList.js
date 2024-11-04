// src/components/TransactionsList.js
import React from 'react';
import useFetch from '../hooks/useFetch';

const TransactionsList = ({ userID }) => {
  const { data: transactions, loading, error } = useFetch(`/api/plaid/transactions/${userID}`);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.description}</td>
              <td>${transaction.amount}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsList;
