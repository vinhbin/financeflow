// src/components/Dashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import Card from './Card';
import './Dashboard.css';
import { getFirstName } from '../utils/nameUtils'; // Import the utility function

const Dashboard = () => {
  console.log('Dashboard component rendered.'); // Debugging log
  const { userID, userName, token, logout } = useAuth(); // Ensure 'token' is available
  const navigate = useNavigate();

  // Use the helper function to get the formatted first name
  const firstName = getFirstName(userName);

  // Redirect to login if userID is not present
  useEffect(() => {
    console.log('Dashboard useEffect: userID =', userID);
    if (!userID) {
      console.log('No userID found. Redirecting to login.');
      navigate('/login'); // Correct redirection
    } else {
      console.log(`User is authenticated as ${userName}. Staying on Dashboard.`);
    }
  }, [userID, navigate, userName]);

  // Fetch data for dashboard conditionally based on userID
  const { data: metrics, loading: metricsLoading, error: metricsError } = useFetch(
    userID ? `/api/expenses/metrics/${userID}` : '',
    userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null
  );

  const { data: expenses, loading: expensesLoading, error: expensesError } = useFetch(
    userID ? `/api/expenses/user/${userID}` : '',
    userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null
  );

  const { data: accounts, loading: accountsLoading, error: accountsError } = useFetch(
    userID ? `/api/plaid/accounts/${userID}` : '',
    userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null
  );

  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useFetch(
    userID ? `/api/plaid/transactions/${userID}` : '',
    userID
      ? {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      : null
  );

  const { data: aiInsight, loading: aiLoading, error: aiError } = useFetch(
    userID ? `/api/ai-insights/generate` : '',
    userID
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          data: { userID },
        }
      : null
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {firstName}!</h2> {/* Displaying the formatted first name */}
        <button className="logout-button" onClick={logout}>Logout</button>
      </div>

      {/* Dashboard Rows */}
      <div className="dashboard-row">
        {/* Linked Bank Accounts */}
        <Card title="Linked Bank Accounts" className="bank-accounts">
          {accountsLoading ? (
            <p>Loading accounts...</p>
          ) : accountsError ? (
            <p className="error-message">{accountsError}</p>
          ) : accounts.message ? (
            <div>
              <p>{accounts.message}</p>
              <button
                className="link-account-button"
                onClick={() => navigate('/link-account')} // Ensure you have a route for linking accounts
              >
                Link Bank Account
              </button>
            </div>
          ) : (
            <ul>
              {accounts.accounts.map((account) => (
                <li key={account.id}>{account.accountName} - {account.type}</li>
              ))}
            </ul>
          )}
        </Card>

        {/* Financial Metrics */}
        <Card title="Financial Metrics" className="metrics">
          {metricsLoading ? (
            <p>Loading metrics...</p>
          ) : metricsError ? (
            <p className="error-message">{metricsError}</p>
          ) : metrics.message ? (
            <p>{metrics.message}</p>
          ) : (
            <div>
              <p>Total Expenses: ${metrics.totalExpenses}</p>
              <p>Upcoming Subscriptions: ${metrics.upcomingSubscriptions}</p>
            </div>
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
          ) : transactions.message ? (
            <div>
              <p>{transactions.message}</p>
              <button
                className="link-account-button"
                onClick={() => navigate('/link-account')} // Ensure you have a route for linking accounts
              >
                Link Bank Account
              </button>
            </div>
          ) : (
            <ul>
              {transactions.transactions.slice(0, 5).map((transaction) => (
                <li key={transaction.transactionID}>
                  {transaction.description}: ${transaction.amount} on {new Date(transaction.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* AI Financial Insight */}
        <Card title="AI Financial Insight" className="ai-insight">
          {aiLoading ? (
            <p>Loading insights...</p>
          ) : aiError ? (
            <p className="error-message">{aiError}</p>
          ) : aiInsight.message ? (
            <div>
              <p>{aiInsight.message}</p>
              <button
                className="generate-insight-button"
                onClick={() => {
                  // Optionally, implement a retry mechanism
                }}
              >
                Generate Insights
              </button>
            </div>
          ) : (
            <p>{aiInsight.insight}</p>
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
          ) : expenses.message ? (
            <p>{expenses.message}</p>
          ) : (
            <ul>
              {expenses.expenses.slice(0, 5).map((expense) => (
                <li key={expense.expenseID}>{expense.description}: ${expense.amount} on {expense.date}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
