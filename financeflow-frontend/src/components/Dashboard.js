import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PlaidLinkButton from './PlaidLinkButton';
import AIInsights from './AIInsights';
import TransactionsList from './TransactionsList';
import './Dashboard.css'; // Add this line to import the CSS

const Dashboard = ({ userID }) => {
  const [metrics, setMetrics] = useState({ totalExpenses: 0, upcomingSubscriptions: 0 });
  const [accounts, setAccounts] = useState([]);
  const [newExpense, setNewExpense] = useState({ amount: '', description: '' });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/expenses/metrics/${userID}`);
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, [userID]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/plaid/accounts/${userID}`);
        setAccounts(response.data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, [userID]);

  const handleAddExpense = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/expenses/create`, { userID, amount: newExpense.amount, description: newExpense.description });
      setNewExpense({ amount: '', description: '' });
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {localStorage.getItem('userName')}!</h2>

      <div className="card metrics-card">
        <h3>Key Metrics</h3>
        <p>Total Expenses: <span>${metrics.totalExpenses}</span></p>
        <p>Upcoming Subscriptions: <span>${metrics.upcomingSubscriptions}</span></p>
      </div>

      <div className="card accounts-card">
        <h3>Bank Accounts</h3>
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <p key={account.id}>Account: {account.name}</p>
          ))
        ) : (
          <PlaidLinkButton userID={userID} />
        )}
      </div>

      <div className="card add-expense-card">
        <h3>Add New Expense</h3>
        <input
          type="number"
          value={newExpense.amount}
          placeholder="Amount"
          onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || '' })}
        />
        <input
          type="text"
          value={newExpense.description}
          placeholder="Description"
          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
        />
        <button
          onClick={handleAddExpense}
          disabled={!newExpense.amount || !newExpense.description}
        >
          Add Expense
        </button>
      </div>
      <div className="card transactions-card">
        <h3>Your Transactions</h3>
        <TransactionsList userID={userID} />
      </div>

      <div className="card insights-card">
        <h3>AI Financial Insights</h3>
        <AIInsights userID={userID} />
      </div>
    </div>
  );
};

export default Dashboard;
