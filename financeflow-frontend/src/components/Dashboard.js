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
  const { userID, userName, logout } = useAuth();
  const navigate = useNavigate();

  // Use the helper function to get the formatted first name
  const firstName = getFirstName(userName);

  // Redirect to login if userID is not present
  useEffect(() => {
    if (!userID) {
      console.log('No userID found. Redirecting to login.');
      navigate('/login'); // Correct redirection
    }
  }, [userID, navigate]);

  // Fetch data for dashboard conditionally based on userID
  const { data: metrics, loading: metricsLoading, error: metricsError } = useFetch(
    userID ? `/api/expenses/metrics/${userID}` : ''
  );
  const { data: expenses, loading: expensesLoading, error: expensesError } = useFetch(
    userID ? `/api/expenses/user/${userID}` : ''
  );
  const { data: accounts, loading: accountsLoading, error: accountsError } = useFetch(
    userID ? `/api/plaid/accounts/${userID}` : ''
  );
  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useFetch(
    userID ? `/api/plaid/transactions/${userID}` : ''
  );
  const { data: aiInsight, loading: aiLoading, error: aiError } = useFetch(
    userID ? `/api/ai-insights/generate` : '',
    userID ? { method: 'POST', data: { userID } } : null
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {firstName}!</h2> {/* Displaying the formatted first name */}
        <button className="logout-button" onClick={logout}>Logout</button>
      </div>

      {/* Rest of the Dashboard content */}
      {/* Example: Display linked bank accounts */}
      <div className="dashboard-row">
        <Card title="Linked Bank Accounts" className="bank-accounts">
          {accountsLoading ? (
            <p>Loading accounts...</p>
          ) : accountsError ? (
            <p>{accountsError}</p>
          ) : (
            <ul>
              {accounts?.map((account) => (
                <li key={account.id}>{account.accountName} - {account.type}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Financial Metrics" className="metrics">
          {metricsLoading ? (
            <p>Loading metrics...</p>
          ) : metricsError ? (
            <p>{metricsError}</p>
          ) : (
            <div>
              <p>Total Expenses: ${metrics?.totalExpenses}</p>
              <p>Upcoming Subscriptions: ${metrics?.upcomingSubscriptions}</p>
            </div>
          )}
        </Card>
      </div>

      <div className="dashboard-row">
        <Card title="Recent Transactions" className="transactions">
          {transactionsLoading ? (
            <p>Loading transactions...</p>
          ) : transactionsError ? (
            <p>{transactionsError}</p>
          ) : (
            <ul>
              {transactions?.slice(0, 5).map((transaction) => (
                <li key={transaction.transactionID}>
                  {transaction.description}: ${transaction.amount} on {new Date(transaction.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="AI Financial Insight" className="ai-insight">
          {aiLoading ? (
            <p>Loading insights...</p>
          ) : aiError ? (
            <p>{aiError}</p>
          ) : (
            <p>{aiInsight}</p>
          )}
        </Card>
      </div>

      <div className="dashboard-row">
        <Card title="Recent Expenses" className="expenses">
          {expensesLoading ? (
            <p>Loading expenses...</p>
          ) : expensesError ? (
            <p>{expensesError}</p>
          ) : (
            <ul>
              {expenses?.slice(0, 5).map((expense) => (
                <li key={expense.expenseID}>{expense.description}: ${expense.amount}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
