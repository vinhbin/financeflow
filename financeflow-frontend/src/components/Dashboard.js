// src/components/Dashboard.js
import React from 'react';
import useFetch from '../hooks/useFetch';
import Card from './Card';

const Dashboard = ({ userID }) => {
  // Fetch total expenses and upcoming subscriptions (metrics)
  const { data: metrics, loading: metricsLoading, error: metricsError } = useFetch(`/api/expenses/metrics/${userID}`);

  // Fetch latest expenses
  const { data: expenses, loading: expensesLoading, error: expensesError } = useFetch(`/api/expenses/user/${userID}`);

  // Fetch linked bank accounts
  const { data: accounts, loading: accountsLoading, error: accountsError } = useFetch(`/api/plaid/accounts/${userID}`);

  // Fetch recent transactions
  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useFetch(`/api/plaid/transactions/${userID}`);

  // Fetch AI insights
  const { data: aiInsight, loading: aiLoading, error: aiError } = useFetch(`/api/ai-insights/generate`, {
    method: 'POST',
    data: { userID },
  });

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Metrics Section */}
      <Card title="Financial Metrics">
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

      {/* Expenses Section */}
      <Card title="Recent Expenses">
        {expensesLoading ? (
          <p>Loading expenses...</p>
        ) : expensesError ? (
          <p>{expensesError}</p>
        ) : (
          <ul>
            {expenses.slice(0, 5).map((expense) => (
              <li key={expense.expenseID}>
                {expense.description}: ${expense.amount}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Bank Accounts Section */}
      <Card title="Linked Bank Accounts">
        {accountsLoading ? (
          <p>Loading accounts...</p>
        ) : accountsError ? (
          <p>{accountsError}</p>
        ) : (
          <ul>
            {accounts.map((account) => (
              <li key={account.accountID}>
                {account.name} - {account.type}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Transactions Section */}
      <Card title="Recent Transactions">
        {transactionsLoading ? (
          <p>Loading transactions...</p>
        ) : transactionsError ? (
          <p>{transactionsError}</p>
        ) : (
          <ul>
            {transactions.slice(0, 5).map((transaction) => (
              <li key={transaction.id}>
                {transaction.description}: ${transaction.amount} on {new Date(transaction.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* AI Financial Insight Section */}
      <Card title="AI Financial Insight">
        {aiLoading ? (
          <p>Loading insights...</p>
        ) : aiError ? (
          <p>{aiError}</p>
        ) : (
          <p>{aiInsight}</p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
