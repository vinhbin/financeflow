// src/components/Dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton'; // Import the PlaidLinkButton
import './Dashboard.css';
import { getFirstName } from '../utils/nameUtils'; // Import the utility function

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
          headers: { Authorization: `Bearer ${token}` },
        }
      : null;
  }, [userID, token]);

  const expensesConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null;
  }, [userID, token]);

  const accountsConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null;
  }, [userID, token]);

  const transactionsConfig = useMemo(() => {
    return userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null;
  }, [userID, token]);

  const aiInsightConfig = useMemo(() => {
    return userID
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          data: { userID },
        }
      : null;
  }, [userID, token]);

  // Fetch data using the useFetch hook
  const { data: metrics, loading: metricsLoading, error: metricsError } = useFetch(
    userID ? `/api/expenses/metrics/${userID}` : '',
    metricsConfig,
    refreshData // Pass the trigger
  );

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
          ) : accounts && accounts.message ? (
            <div>
              <p>{accounts.message}</p>
              <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
            </div>
          ) : accounts && accounts.accounts ? (
            <div>
              <ul>
                {accounts.accounts.map((account) => (
                  <li key={account.id}>
                    {account.accountName} - {account.type}
                  </li>
                ))}
              </ul>
              <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
            </div>
          ) : (
            <p>No linked bank accounts found.</p>
          )}
        </Card>

        {/* Financial Metrics */}
        <Card title="Financial Metrics" className="metrics">
          {metricsLoading ? (
            <p>Loading metrics...</p>
          ) : metricsError ? (
            <p className="error-message">{metricsError}</p>
          ) : metrics && metrics.message ? (
            <p>{metrics.message}</p>
          ) : metrics && metrics.totalExpenses !== undefined && metrics.upcomingSubscriptions !== undefined ? (
            <div>
              <p>Total Expenses: ${metrics.totalExpenses}</p>
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
          ) : transactions && transactions.message ? (
            <div>
              <p>{transactions.message}</p>
              <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
            </div>
          ) : transactions && transactions.transactions ? (
            <ul>
              {transactions.transactions.slice(0, 5).map((transaction) => (
                <li key={transaction.transactionID}>
                  {transaction.description}: ${transaction.amount} on{' '}
                  {new Date(transaction.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
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
          ) : aiInsight && aiInsight.message ? (
            <div>
              <p>{aiInsight.message}</p>
              <button
                className="generate-insight-button"
                onClick={() => {
                  // Optionally, implement a retry mechanism or re-fetch AI insights
                }}
              >
                Generate Insights
              </button>
            </div>
          ) : aiInsight && aiInsight.insight ? (
            <p>{aiInsight.insight}</p>
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
          ) : expenses && expenses.message ? (
            <p>{expenses.message}</p>
          ) : expenses && expenses.expenses ? (
            <ul>
              {expenses.expenses.slice(0, 5).map((expense) => (
                <li key={expense.expenseID}>
                  {expense.description}: ${expense.amount} on {expense.date}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent expenses found.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
