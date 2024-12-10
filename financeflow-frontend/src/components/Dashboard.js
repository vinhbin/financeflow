// src/components/Dashboard.js
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton';
import AddExpense from './AddExpense';
import ExpenseItem from './ExpenseItem';
import NumberRoll from './NumberRoll';
import './Dashboard.css';
import './ScrollableContainer.css'; // Import the custom scroll styling
import { getFirstName } from '../utils/nameUtils';
import api from '../utils/api';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BudgetCard from './BudgetCard';
import ChallengeCard from './ChallengeCard';
import { motion } from 'framer-motion';

const Dashboard = ({ direction }) => {
  console.log('Dashboard: Rendering component.');
  const { userID, userName, token, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshData, setRefreshData] = useState(false); 
  const [fetchAIInsight, setFetchAIInsight] = useState(false);
  const [displayedInsight, setDisplayedInsight] = useState('');
  const [fullInsight, setFullInsight] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Get the user's first name for greeting
  const firstName = getFirstName(userName);

  console.log('Dashboard: userID =', userID);
  console.log('Dashboard: token =', token);

  // If no userID, redirect to login
  useEffect(() => {
    console.log('Dashboard useEffect: userID =', userID);
    if (!userID) {
      console.log('No userID found. Redirecting to login.');
      navigate('/login');
    } else {
      console.log(`User is authenticated as ${userName}. Staying on Dashboard.`);
    }
  }, [userID, navigate, userName]);

  /**
   * Function: Trigger data refresh for expenses
   */
  const refreshExpenses = () => {
    setRefreshData((prev) => !prev);
  };

  // Memoize configurations for fetching data
  const expensesConfig = useMemo(() => (userID ? { method: 'GET' } : null), [userID]);
  const accountsConfig = useMemo(() => (userID ? { method: 'GET' } : null), [userID]);
  const transactionsConfig = useMemo(() => (userID ? { method: 'GET' } : null), [userID]);
  const aiInsightConfig = useMemo(() => (userID && fetchAIInsight ? { method: 'POST' } : null), [userID, fetchAIInsight]);
  const categoriesConfig = useMemo(() => ({ method: 'GET' }), []);
  const currenciesConfig = useMemo(() => ({ method: 'GET' }), []);

  // Fetching data using useFetch hook
  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useFetch(
    userID ? `/api/expenses/user/${userID}` : '',
    expensesConfig,
    refreshData
  );

  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useFetch(
    userID ? `/api/plaid/accounts/${userID}` : '',
    accountsConfig,
    refreshData
  );

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useFetch(
    userID ? `/api/plaid/transactions/${userID}` : '',
    transactionsConfig,
    refreshData
  );

  const { data: aiInsight, isLoading: aiLoading, error: aiError } = useFetch(
    userID && fetchAIInsight ? `/api/ai-insights/generate` : '',
    aiInsightConfig
  );

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useFetch(
    userID ? `/api/categories/user/${userID}` : '',
    categoriesConfig,
    refreshData
  );

  const { data: currenciesData, isLoading: currenciesLoading, error: currenciesError } = useFetch(
    userID ? `/api/expenses/currency` : '',
    currenciesConfig,
    false
  );

  // Reset fetchAIInsight after AI data is fetched
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

  // Typing effect for displaying AI Insight character by character
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
      }, 20); 
    }
    return () => clearInterval(typingTimer);
  }, [isTyping, fullInsight]);

  // Log fetched data (helpful for debugging)
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

  useEffect(() => {
    console.log('Dashboard: Fetched categories data:', categoriesData);
  }, [categoriesData]);

  useEffect(() => {
    console.log('Dashboard: Fetched currencies data:', currenciesData);
  }, [currenciesData]);

  // Refresh data every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Dashboard: Interval triggered, toggling refreshData.');
      setRefreshData((prev) => !prev);
    }, 60000); 
    return () => {
      console.log('Dashboard: Clearing interval.');
      clearInterval(interval);
    };
  }, []);

  // Initial data fetch when user logs in
  useEffect(() => {
    if (userID) {
      console.log('Dashboard: Initial data fetch triggered.');
      setRefreshData((prev) => !prev);
    }
  }, [userID]);

  /**
   * Function: Unlink a bank account
   * @param {number} accountId - ID of the account to unlink
   */
  const unlinkAccount = async (accountId) => {
    try {
      console.log(`Dashboard: Attempting to unlink account ID ${accountId}`);
      await api.delete(`/api/plaid/accounts/${accountId}`);
      console.log(`Dashboard: Successfully unlinked account ID ${accountId}`);
      toast.success('Account unlinked successfully!');
      setRefreshData((prev) => !prev);
    } catch (err) {
      console.error('Dashboard: Error unlinking account:', err.response?.data || err.message);
      toast.error(`Error unlinking account: ${err.response?.data?.error || err.message}`);
    }
  };

  /**
   * Function: Delete an expense
   * @param {number} expenseID - ID of the expense to delete
   */
  const handleDeleteExpense = async (expenseID) => {
    try {
      console.log(`Deleting expense with ID ${expenseID}`);
      await api.delete(`/api/expenses/${expenseID}`);
      toast.success('Expense deleted successfully!');
      setRefreshData((prev) => !prev);
    } catch (err) {
      console.error('Error deleting expense:', err.response?.data || err.message);
      toast.error(`Error deleting expense: ${err.response?.data?.error || err.message}`);
    }
  };

  // Convert categories into a lookup map for quick access by categoryID
  const categoryMap = useMemo(() => {
    if (categoriesData && categoriesData.categories) {
      const map = {};
      categoriesData.categories.forEach(cat => {
        map[cat.categoryID] = cat.name;
      });
      return map;
    }
    return {};
  }, [categoriesData]);

  /**
   * Function: Get currency symbol for a given currency code
   * If currenciesData is fetched, use that. Otherwise, fallback to defaults.
   */
  const getCurrencySymbol = (currencyCode) => {
    if (currenciesData && currenciesData.currencies) {
      const currency = currenciesData.currencies.find((curr) => curr.code === currencyCode);
      return currency ? currency.symbol : '$';
    }
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '$';
    }
  };

  // Helper functions for conditional coloring of totals
  const getTotalExpensesColor = (value) => (value > 0 ? '#e74c3c' : '#ffffff');
  const getTotalIncomeColor = (value) => (value > 0 ? '#2ecc71' : '#ffffff');
  const getNetTotalColor = (value) => {
    if (value > 0) return '#2ecc71';
    if (value < 0) return '#e74c3c';
    return '#ffffff';
  };

  // State for totals
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [combinedTotal, setCombinedTotal] = useState(0);

  // Calculate financial totals based on expenses and transactions
  useEffect(() => {
    if (!expenses || !transactions) {
      return;
    }

    // Calculate total expenses
    let expensesTotal = 0;
    if (expenses.expenses && expenses.expenses.length > 0) {
      expensesTotal = expenses.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    }

    // Calculate total income and expenses from transactions
    let transactionsIncome = 0;
    let transactionsExpenses = 0;
    if (transactions.transactions && transactions.transactions.length > 0) {
      transactions.transactions.forEach((transaction) => {
        const amount = parseFloat(transaction.amount);
        if (amount < 0) {
          transactionsIncome += -amount; // Negative = income
        } else {
          transactionsExpenses += amount; // Positive = expense
        }
      });
    }

    const newTotalExpenses = expensesTotal + transactionsExpenses;
    const newTotalIncome = transactionsIncome;
    const newCombinedTotal = newTotalIncome - newTotalExpenses;

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

  // Animation variants for page transitions
  const variants = {
    forward: {
      x: 1000,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    backward: {
      x: -1000,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  // Refs for scrollable containers
  const expenseListRef = useRef(null);
  const transactionListRef = useRef(null);
  const aiInsightRef = useRef(null); // For AI Financial Insight scrollable

  // Show/hide scrollbar for Recent Expenses after 1.5s of inactivity
  useEffect(() => {
    let timeoutId;

    const handleExpenseScroll = () => {
      const el = expenseListRef.current;
      if (!el) return;

      el.classList.add('scroll-active');
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        el.classList.remove('scroll-active');
      }, 1500);
    };

    const el = expenseListRef.current;
    if (el) {
      el.addEventListener('scroll', handleExpenseScroll, { passive: true });
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', handleExpenseScroll);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Show/hide scrollbar for Recent Transactions after 1.5s of inactivity
  useEffect(() => {
    let timeoutId;

    const handleTransactionScroll = () => {
      const el = transactionListRef.current;
      if (!el) return;

      el.classList.add('scroll-active');
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        el.classList.remove('scroll-active');
      }, 1500);
    };

    const el = transactionListRef.current;
    if (el) {
      el.addEventListener('scroll', handleTransactionScroll, { passive: true });
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', handleTransactionScroll);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Show/hide scrollbar for AI Insight after 1.5s of inactivity
  useEffect(() => {
    let timeoutId;

    const handleAIInsightScroll = () => {
      const el = aiInsightRef.current;
      if (!el) return;

      el.classList.add('scroll-active');
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        el.classList.remove('scroll-active');
      }, 1500);
    };

    const el = aiInsightRef.current;
    if (el) {
      el.addEventListener('scroll', handleAIInsightScroll, { passive: true });
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', handleAIInsightScroll);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <motion.div
        className="dashboard"
        initial={direction === 'backward' ? variants.backward : 'center'}
        animate="center"
        exit={direction === 'backward' ? variants.backward : 'center'}
        variants={variants}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="dashboard-header">
          <h2>Welcome, {firstName}!</h2>
          <div className="dashboard-buttons">
            <button
              className="statistics-button"
              onClick={() => navigate('/statistics', { state: { direction: 'forward' } })}
              aria-label="Statistics"
            >
              Statistics
            </button>
            <button className="logout-button" onClick={logout} aria-label="Logout">
              Logout
            </button>
          </div>
        </div>

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
              </div>
            ) : (
              <p>No linked bank accounts found.</p>
            )}
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
                    <span className="currency-symbol">{getCurrencySymbol('USD')}</span>
                    <NumberRoll value={totalExpenses} />
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Total Income</span>
                  <span
                    className="metric-amount"
                    style={{ color: getTotalIncomeColor(totalIncome) }}
                  >
                    <span className="currency-symbol">{getCurrencySymbol('USD')}</span>
                    <NumberRoll value={totalIncome} />
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Net Total</span>
                  <span
                    className="metric-amount"
                    style={{ color: getNetTotalColor(combinedTotal) }}
                  >
                    <span className="currency-symbol">{getCurrencySymbol('USD')}</span>
                    <NumberRoll value={combinedTotal} />
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="dashboard-row">
          <BudgetCard />
          <ChallengeCard />
        </div>

        <div className="dashboard-row">
          {/* Recent Transactions (7 visible before scrolling) */}
          <Card title="Recent Transactions" className="transactions card">
            {transactionsLoading && !transactions ? (
              <p>Loading transactions...</p>
            ) : transactionsError ? (
              <p className="error-message">{transactionsError}</p>
            ) : transactions && transactions.transactions && transactions.transactions.length > 0 ? (
              <TransitionGroup
                component="ul"
                className="transaction-list scrollable-container"
                ref={transactionListRef}
              >
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
                          {getCurrencySymbol(transaction.currency || 'USD')}
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
          </Card>

          {/* AI Financial Insight: Scrollable area + button outside */}
          <Card title="AI Financial Insight" className="ai-insight card">
            {/* Make the AI Insight container scrollable */}
            <div
              className="ai-insight-container scrollable-container"
              ref={aiInsightRef}
            >
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
            {/* Button outside the scrollable container */}
            <button
              className="glass-button"
              onClick={() => {
                setFetchAIInsight(true);
              }}
              disabled={isTyping}
              aria-label="Generate AI Insight"
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
              <TransitionGroup
                component="ul"
                className="expense-list scrollable-container"
                ref={expenseListRef}
              >
                {expenses.expenses.slice(0, 60).map((expense) => (
                  <CSSTransition key={expense.expenseID} timeout={300} classNames="expense">
                    <ExpenseItem
                      key={expense.expenseID}
                      expense={expense}
                      categories={categoryMap}
                      currencySymbol={getCurrencySymbol}
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
            <AddExpense
              onExpenseAdded={refreshExpenses}
              categories={categoriesData ? categoriesData.categories : []}
              currencies={currenciesData ? currenciesData.currencies : []}
            />
          </Card>
        </div>
      </motion.div>

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
        toastClassName="custom-toast"
        containerClassName="custom-toast-container"
      />
    </>
  );
};

export default Dashboard;
