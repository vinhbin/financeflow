// src/components/Dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton'; // Import the PlaidLinkButton
import AddExpense from './AddExpense';// Import the AddExpense component
import './Dashboard.css';
import { getFirstName } from '../utils/nameUtils'; // Import the utility function
import api from '../utils/api'; // Import the configured Axios instance

const Dashboard = () => {
  console.log('Dashboard component rendered.');
  const { userID, userName, token, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshData, setRefreshData] = useState(false); // State to trigger refetching data

  const firstName = getFirstName(userName);

  // Redirect to login if userID is not present
  useEffect(() => {
    console.log('Dashboard useEffect: userID =', userID);
    if (!userID) {
      console.log('No userID found. Redirecting to login.');
      navigate('/login');
    } else {
      console.log(`User is authenticated as ${userName}. Staying on Dashboard.`);
    }
  }, [userID, navigate, userName]);

  // Memoize configuration objects to prevent unnecessary re-fetching
  const metricsConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
        }
      : null;
  }, [userID]);

  const expensesConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
        }
      : null;
  }, [userID]);

  const accountsConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
        }
      : null;
  }, [userID]);

  const transactionsConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
        }
      : null;
  }, [userID]);

  const aiInsightConfig = useMemo(() => {
    return userID
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { userID },
        }
      : null;
  }, [userID]);

  // Fetch data using the useFetch hook
  const { data: metrics, loading: metricsLoading, error: metricsError } = useFetch(
    userID ? `/api/expenses/metrics/${userID}` : '',
    metricsConfig,
    refreshData // Pass the trigger
  );
    // Log the `userID` and `metrics` data for debugging
    console.log('Dashboard: Fetching metrics for userID:', userID);
    if (metricsLoading) console.log('Dashboard: Metrics loading...');
    if (metricsError) console.error('Dashboard: Error fetching metrics:', metricsError);
    console.log('Dashboard: Fetched metrics data:', metrics);
  

  const { data: expenses, loading: expensesLoading, error: expensesError } = useFetch(
    userID ? `/api/expenses/user/${userID}` : '',
    expensesConfig,
    refreshData // Pass the trigger
  );

  const { data: accounts, loading: accountsLoading, error: accountsError } = useFetch(
    userID ? `/api/plaid/accounts/${userID}` : '',
    accountsConfig,
    refreshData // Pass the trigger
  );

  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useFetch(
    userID ? `/api/plaid/transactions/${userID}` : '',
    transactionsConfig,
    refreshData // Pass the trigger
  );

  const { data: aiInsight, loading: aiLoading, error: aiError } = useFetch(
    userID ? `/api/ai-insights/generate` : '',
    aiInsightConfig
    // Not passing refreshData here as AI insights might not need to be fetched periodically
  );

  // Set up an interval to refresh data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshData((prev) => !prev); // Toggle to trigger re-fetch
    }, 60000); // 60000 milliseconds = 1 minute

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  // Initial data fetch when the user logs in
  useEffect(() => {
    if (userID) {
      setRefreshData((prev) => !prev);
    }
  }, [userID]);

  // Function to unlink an account
  const unlinkAccount = async (accountId) => {
    try {
      await api.delete(`/api/plaid/accounts/${accountId}`); // Use api instead of axios
      setRefreshData((prev) => !prev); // Trigger data refetch
    } catch (err) {
      console.error('Error unlinking account:', err.response?.data || err.message);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {firstName}!</h2>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>



      {/* Dashboard Rows */}
      <div className="dashboard-row">
        {/* Linked Bank Accounts */}
        <Card title="Linked Bank Accounts" className="bank-accounts">
          {accountsLoading ? (
            <p>Loading accounts...</p>
          ) : accountsError ? (
            <p className="error-message">{accountsError}</p>
          ) : accounts && accounts.accounts && accounts.accounts.length > 0 ? (
            <div>
              <ul>
                {accounts.accounts.map((account) => (
                  <li key={account.id} className="account-item">
                    <span>
                      {account.accountName} - {account.type}
                    </span>
                    <button
                      onClick={() => unlinkAccount(account.id)}
                      className="link-account-button"
                    >
                      Unlink
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No linked bank accounts found.</p>
          )}
          {/* Always render the PlaidLinkButton */}
          <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
        </Card>


        {/* Financial Metrics */}
        <Card title="Financial Metrics" className="metrics">
          {metricsLoading ? (
            <p>Loading metrics...</p>
          ) : metricsError ? (
            <p className="error-message">{metricsError}</p>
          ) : metrics && metrics.message ? (
            <p>{metrics.message}</p>
          ) : metrics && metrics.combinedTotal !== undefined && metrics.upcomingSubscriptions !== undefined ? (
            <div>
              <p>Total Expenses: ${metrics.combinedTotal}</p>
              <p>Upcoming Subscriptions: ${metrics.upcomingSubscriptions}</p>
            </div>
          ) : (
            <p>No financial metrics available.</p>
          )}
        </Card>
      </div>
      
      

      <div className="dashboard-row">
        {/* Recent Transactions */}
        <Card title="Recent Transactions" className="transactions">
          {transactionsLoading ? (
            <p>Loading transactions...</p>
          ) : transactionsError ? (
            <p className="error-message">{transactionsError}</p>
          ) : transactions && transactions.transactions && transactions.transactions.length > 0 ? (
            <ul>
              {transactions.transactions.slice(0, 60).map((transaction) => (
                <li key={transaction.transactionID}>
                  {transaction.description}: ${transaction.amount} on{' '}
                  {new Date(transaction.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : transactions && transactions.message ? (
            <div>
              <p>{transactions.message}</p>
              <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
            </div>
          ) : (
            <p>No recent transactions found.</p>
          )}
        </Card>

        {/* AI Financial Insight */}
        <Card title="AI Financial Insight" className="ai-insight">
          {aiLoading ? (
            <p>Loading insights...</p>
          ) : aiError ? (
            <p className="error-message">{aiError}</p>
          ) : aiInsight && aiInsight.insight ? (
            <p>{aiInsight.insight}</p>
          ) : aiInsight && aiInsight.message ? (
            <div>
              <p>{aiInsight.message}</p>
              <button
                className="glass-button generate-insight-button"
                onClick={() => {
                  // Optionally, implement a retry mechanism or re-fetch AI insights
                }}
              >
                Generate Insights
              </button>
            </div>
          ) : (
            <p>No AI insights available.</p>
          )}
        </Card>
      </div>

      <div className="dashboard-row">
        {/* Recent Expenses */}
        <Card title="Recent Expenses" className="expenses">
          {expensesLoading ? (
            <p>Loading expenses...</p>
          ) : expensesError ? (
            <p className="error-message">{expensesError}</p>
          ) : expenses && expenses.expenses && expenses.expenses.length > 0 ? (
            <ul>
              {expenses.expenses.slice(0, 60).map((expense) => (
                <li key={expense.expenseID}>
                  {expense.description}: ${expense.amount} on {expense.date}
                </li>
              ))}
            </ul>
          ) : expenses && expenses.message ? (
            <p>{expenses.message}</p>
          ) : (
            <p>No recent expenses found.</p>
          )}
        </Card>

        {/* Add Expense Card */}
        <Card title="Add Expense" className="add-expense">
          <AddExpense />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
