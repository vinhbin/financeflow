// src/components/Dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton';
import AddExpense from './AddExpense';
import ExpenseItem from './ExpenseItem';
import NumberRoll from './NumberRoll'; // Import the NumberRoll component
import './Dashboard.css'; // Ensure this imports the existing Dashboard.css
import { getFirstName } from '../utils/nameUtils';
import api from '../utils/api';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  console.log('Dashboard: Rendering component.');
  const { userID, userName, token, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshData, setRefreshData] = useState(false); // State to trigger refetching data
  const [fetchAIInsight, setFetchAIInsight] = useState(false); // State to control when to fetch AI insights
  const [displayedInsight, setDisplayedInsight] = useState(''); // State for typing effect
  const [fullInsight, setFullInsight] = useState(''); // Full AI insight text
  const [isTyping, setIsTyping] = useState(false); // Indicates if typing effect is in progress

  const firstName = getFirstName(userName);

  console.log('Dashboard: userID =', userID);
  console.log('Dashboard: token =', token);

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

  // Function to refresh expenses data
  const refreshExpenses = () => {
    setRefreshData((prev) => !prev);
  };

  // Memoize configuration objects to prevent unnecessary re-fetching
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

  // AI Insight fetch configuration
  const aiInsightConfig = useMemo(() => {
    return userID && fetchAIInsight
      ? {
          method: 'POST',
        }
      : null;
  }, [userID, fetchAIInsight]);

  // Fetch data using the useFetch hook
  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useFetch(
    userID ? `/api/expenses/user/${userID}` : '',
    expensesConfig,
    refreshData // Pass the trigger
  );

  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useFetch(
    userID ? `/api/plaid/accounts/${userID}` : '',
    accountsConfig,
    refreshData // Pass the trigger
  );

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useFetch(
    userID ? `/api/plaid/transactions/${userID}` : '',
    transactionsConfig,
    refreshData // Pass the trigger
  );

  const { data: aiInsight, isLoading: aiLoading, error: aiError } = useFetch(
    userID && fetchAIInsight ? `/api/ai-insights/generate` : '',
    aiInsightConfig
  );

  // Reset fetchAIInsight after fetching
  useEffect(() => {
    if (aiInsight && aiInsight.insight) {
      setFetchAIInsight(false);
      setFullInsight(aiInsight.insight);
      setDisplayedInsight('');
      setIsTyping(true);
    } else if (aiError) {
      setFetchAIInsight(false);
    }
  }, [aiInsight, aiError]);

  // Typing effect for AI Insight
  useEffect(() => {
    let typingTimer;
    if (isTyping && fullInsight) {
      let index = 0;
      typingTimer = setInterval(() => {
        setDisplayedInsight(fullInsight.slice(0, index + 1));
        index++;
        if (index >= fullInsight.length) {
          clearInterval(typingTimer);
          setIsTyping(false);
        }
      }, 20); // Adjust the speed as needed (milliseconds per character)
    }
    return () => clearInterval(typingTimer);
  }, [isTyping, fullInsight]);

  // Add logs for fetched data
  useEffect(() => {
    console.log('Dashboard: Fetched expenses data:', expenses);
  }, [expenses]);

  useEffect(() => {
    console.log('Dashboard: Fetched accounts data:', accounts);
  }, [accounts]);

  useEffect(() => {
    console.log('Dashboard: Fetched transactions data:', transactions);
  }, [transactions]);

  useEffect(() => {
    console.log('Dashboard: Fetched AI insight:', aiInsight);
  }, [aiInsight]);

  // Set up an interval to refresh data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Dashboard: Interval triggered, toggling refreshData.');
      setRefreshData((prev) => !prev); // Toggle to trigger re-fetch
    }, 60000); // 60000 milliseconds = 1 minute

    return () => {
      console.log('Dashboard: Clearing interval.');
      clearInterval(interval); // Clean up on unmount
    };
  }, []);

  // Initial data fetch when the user logs in
  useEffect(() => {
    if (userID) {
      console.log('Dashboard: Initial data fetch triggered.');
      setRefreshData((prev) => !prev);
    }
  }, [userID]);

  // Function to unlink an account
  const unlinkAccount = async (accountId) => {
    try {
      console.log(`Dashboard: Attempting to unlink account ID ${accountId}`);
      await api.delete(`/api/plaid/accounts/${accountId}`); // Use api instead of axios
      console.log(`Dashboard: Successfully unlinked account ID ${accountId}`);
      toast.success('Account unlinked successfully!');
      setRefreshData((prev) => !prev); // Trigger data refetch
    } catch (err) {
      console.error('Dashboard: Error unlinking account:', err.response?.data || err.message);
      toast.error(`Error unlinking account: ${err.response?.data?.error || err.message}`);
    }
  };

  // Function to delete an expense
  const handleDeleteExpense = async (expenseID) => {
    try {
      console.log(`Deleting expense with ID ${expenseID}`);
      await api.delete(`/api/expenses/${expenseID}`);
      toast.success('Expense deleted successfully!');
      // Trigger data refetch
      setRefreshData((prev) => !prev);
    } catch (err) {
      console.error('Error deleting expense:', err.response?.data || err.message);
      toast.error(`Error deleting expense: ${err.response?.data?.error || err.message}`);
    }
  };

  // Map of category IDs to category names
  const categories = {
    1: 'Food',
    2: 'Transportation',
    3: 'Utilities',
    4: 'Entertainment',
    5: 'Health',
    6: 'Other',
    // Add more categories if needed
  };

  const currencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      // Add more currencies as needed
      default:
        return '$';
    }
  };

  // Helper functions for conditional coloring
  const getTotalExpensesColor = (value) => {
    return value > 0 ? '#e74c3c' : '#ffffff'; // Red if > 0, else white
  };

  const getTotalIncomeColor = (value) => {
    return value > 0 ? '#2ecc71' : '#ffffff'; // Green if > 0, else white
  };

  const getNetTotalColor = (value) => {
    if (value > 0) return '#2ecc71'; // Green
    if (value < 0) return '#e74c3c'; // Red
    return '#ffffff'; // White
  };

  // State variables for totals
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [combinedTotal, setCombinedTotal] = useState(0);

  // Calculate totals when expenses or transactions data changes
  useEffect(() => {
    // Only proceed if we have expenses and transactions data
    if (!expenses || !transactions) {
      return;
    }

    // Calculate total expenses from expenses data
    let expensesTotal = 0;
    if (expenses.expenses && expenses.expenses.length > 0) {
      expensesTotal = expenses.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    }

    // Calculate total income and expenses from transactions data
    let transactionsIncome = 0;
    let transactionsExpenses = 0;
    if (transactions.transactions && transactions.transactions.length > 0) {
      transactions.transactions.forEach((transaction) => {
        const amount = parseFloat(transaction.amount);
        if (amount < 0) {
          transactionsIncome += -amount; // Income (negative amounts)
        } else {
          transactionsExpenses += amount; // Expenses (positive amounts)
        }
      });
    }

    // Calculate new totals
    const newTotalExpenses = expensesTotal + transactionsExpenses;
    const newTotalIncome = transactionsIncome;
    const newCombinedTotal = newTotalIncome - newTotalExpenses;

    // Update state variables only if the values have changed
    if (totalExpenses !== newTotalExpenses) {
      setTotalExpenses(newTotalExpenses);
    }
    if (totalIncome !== newTotalIncome) {
      setTotalIncome(newTotalIncome);
    }
    if (combinedTotal !== newCombinedTotal) {
      setCombinedTotal(newCombinedTotal);
    }
  }, [expenses, transactions, totalExpenses, totalIncome, combinedTotal]);

  return (
    <>
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
          <Card title="Linked Bank Accounts" className="bank-accounts card">
            {!accounts && accountsLoading ? (
              <p>Loading accounts...</p>
            ) : accountsError ? (
              <p className="error-message">{accountsError}</p>
            ) : accounts && accounts.accounts && accounts.accounts.length > 0 ? (
              <div>
                <TransitionGroup component="ul" className="account-list">
                  {accounts.accounts.map((account) => (
                    <CSSTransition key={account.id} timeout={300} classNames="account">
                      <li className="account-item">
                        <span>
                          {account.accountName} - {account.type}
                        </span>
                        <button
                          onClick={() => unlinkAccount(account.id)}
                          className="unlink-button"
                          aria-label={`Unlink account ${account.accountName}`}
                        >
                          Unlink
                        </button>
                      </li>
                    </CSSTransition>
                  ))}
                </TransitionGroup>
                {/* No "Loading..." message during refetch if data is present */}
              </div>
            ) : (
              <p>No linked bank accounts found.</p>
            )}
            {/* Always render the PlaidLinkButton */}
            <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
          </Card>

          {/* Financial Metrics */}
          <Card title="Financial Metrics" className="metrics card">
            {expensesError || transactionsError ? (
              <p className="error-message">Error fetching financial metrics.</p>
            ) : (
              <div className="metrics-container">
                <div className="metric-item">
                  <span className="metric-label">Total Expenses</span>
                  <span
                    className="metric-amount"
                    style={{ color: getTotalExpensesColor(totalExpenses) }}
                  >
                    <span className="currency-symbol">{currencySymbol('USD')}</span>
                    <NumberRoll value={totalExpenses} />
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Total Income</span>
                  <span
                    className="metric-amount"
                    style={{ color: getTotalIncomeColor(totalIncome) }}
                  >
                    <span className="currency-symbol">{currencySymbol('USD')}</span>
                    <NumberRoll value={totalIncome} />
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Net Total</span>
                  <span
                    className="metric-amount"
                    style={{ color: getNetTotalColor(combinedTotal) }}
                  >
                    <span className="currency-symbol">{currencySymbol('USD')}</span>
                    <NumberRoll value={combinedTotal} />
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="dashboard-row">
          {/* Recent Transactions */}
          <Card title="Recent Transactions" className="transactions card">
            {transactionsLoading && !transactions ? (
              <p>Loading transactions...</p>
            ) : transactionsError ? (
              <p className="error-message">{transactionsError}</p>
            ) : transactions && transactions.transactions && transactions.transactions.length > 0 ? (
              <TransitionGroup component="ul" className="transaction-list">
                {transactions.transactions.slice(0, 60).map((transaction) => (
                  <CSSTransition key={transaction.transactionID} timeout={300} classNames="transaction">
                    <li key={transaction.transactionID} className="transaction-item">
                      <div className="transaction-row">
                        <span className="transaction-description">{transaction.description}</span>
                        <span className="transaction-date">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="transaction-details">
                        <span className="transaction-category">{transaction.category || 'Unknown Category'}</span>
                        <span className="transaction-amount">
                          {currencySymbol(transaction.currency || 'USD')}
                          {Number(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            ) : transactions && transactions.message ? (
              <div>
                <p>{transactions.message}</p>
                <PlaidLinkButton onSuccessCallback={() => setRefreshData((prev) => !prev)} />
              </div>
            ) : (
              <p>No recent transactions found.</p>
            )}
            {/* No "Loading..." message during refetch if data is present */}
          </Card>

          {/* AI Financial Insight */}
          <Card title="AI Financial Insight" className="ai-insight card">
            <div className="ai-insight-container">
              {aiLoading ? (
                <p>Loading insights...</p>
              ) : aiError ? (
                <div>
                  <p className="error-message">{aiError}</p>
                </div>
              ) : displayedInsight ? (
                <div className="ai-insight-content">
                  <p style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {displayedInsight}
                  </p>
                </div>
              ) : (
                <div>
                  <p>No AI insights available.</p>
                </div>
              )}
            </div>
            <button
              className="glass-button"
              onClick={() => {
                setFetchAIInsight(true);
              }}
              disabled={isTyping}
            >
              {isTyping ? 'Generating...' : 'Generate Insight'}
            </button>
          </Card>
        </div>

        <div className="dashboard-row">
          {/* Recent Expenses */}
          <Card title="Recent Expenses" className="expenses card">
            {expensesLoading && !expenses ? (
              <p>Loading expenses...</p>
            ) : expensesError ? (
              <p className="error-message">{expensesError}</p>
            ) : expenses && expenses.expenses && expenses.expenses.length > 0 ? (
              <TransitionGroup component="ul" className="expense-list">
                {expenses.expenses.slice(0, 60).map((expense) => (
                  <CSSTransition key={expense.expenseID} timeout={300} classNames="expense">
                    <ExpenseItem
                      key={expense.expenseID}
                      expense={expense}
                      categories={categories}
                      currencySymbol={currencySymbol}
                      onDelete={handleDeleteExpense}
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            ) : expenses && expenses.message ? (
              <p>{expenses.message}</p>
            ) : (
              <p>No recent expenses found.</p>
            )}
          </Card>

          {/* Add Expense Card */}
          <Card title="Add Expense" className="add-expense card">
            <AddExpense onExpenseAdded={refreshExpenses} />
          </Card>
        </div>
      </div>
      {/* Toast Container for Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="custom-toast"             /* Custom class for individual toasts */
        containerClassName="custom-toast-container"
/>
    </>
  );
};

export default Dashboard;
