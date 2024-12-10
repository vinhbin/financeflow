// src/components/BudgetCard.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import Card from './Card';
import ProgressBar from './ProgressBar';
import './BudgetCard.css';
import { toast } from 'react-toastify';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const currencySymbol = (currencyCode) => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'CAD':
      return 'C$';
    case 'AUD':
      return 'A$';
    case 'CHF':
      return 'CHF';
    case 'CNY':
      return '¥';
    case 'INR':
      return '₹';
    case 'BRL':
      return 'R$';
    default:
      return '$';
  }
};

const BudgetCard = () => {
  const { userID } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');

  const [currency, setCurrency] = useState('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Raw digits for amount (like AddExpense)
  const [rawAmount, setRawAmount] = useState('');

  // Date masking
  const [dateDigits, setDateDigits] = useState('');
  const hiddenDateRef = useRef(null);

  const [newBudget, setNewBudget] = useState({
    accountID: '',
    goalName: '',
  });

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await api.get('/api/budgets', {
          params: { t: Date.now() },
        });
        setBudgets(response.data.budgets);
      } catch (err) {
        console.error('Error fetching budgets:', err.response?.data || err.message);
        toast.error('Failed to fetch budgets.');
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await api.get(`/api/plaid/accounts/${userID}`);
        setAccounts(response.data.accounts);
      } catch (err) {
        console.error('Error fetching accounts:', err.response?.data || err.message);
        toast.error('Failed to fetch accounts.');
      }
    };

    if (userID) {
      fetchBudgets();
      fetchAccounts();
    }
  }, [userID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 10);
    setRawAmount(digits);
  };

  const formattedAmount = (() => {
    const amountNumber = parseFloat(rawAmount) / 100 || 0;
    return amountNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  })();

  const handleDateInputChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDateDigits(digits);
  };

  const maskedDate = (() => {
    const mm = dateDigits.slice(0, 2);
    const dd = dateDigits.slice(2, 4);
    const yyyy = dateDigits.slice(4, 8);

    let dateStr = mm;
    if (dateDigits.length > 2) dateStr += '/' + dd;
    else if (dateDigits.length > 0) dateStr += '/';
    if (dateDigits.length > 4) dateStr += '/' + yyyy;
    else if (dateDigits.length > 2) dateStr += '/';

    return dateStr;
  })();

  const openCalendar = () => {
    if (hiddenDateRef.current) {
      hiddenDateRef.current.showPicker?.();
      hiddenDateRef.current.focus();
      hiddenDateRef.current.click();
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoToday = today.toISOString().split('T')[0];

  const handleHiddenDateChange = (e) => {
    const selected = e.target.value; // YYYY-MM-DD
    if (selected) {
      const parts = selected.split('-');
      if (parts.length === 3) {
        const mm = parts[1];
        const dd = parts[2];
        const yyyy = parts[0];
        const newDigits = mm + dd + yyyy;
        setDateDigits(newDigits);
      }
    }
  };

  const handleCurrencyClick = () => {
    setShowCurrencyDropdown(!showCurrencyDropdown);
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyDropdown(false);
  };

  const currencyRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateProgress = (budget) => {
    const { currentAmount, targetAmount } = budget;
    if (!targetAmount || targetAmount === 0) return '0.00';
    const progress = (currentAmount / targetAmount) * 100;
    return progress.toFixed(2);
  };

  const calculateSavingsPerPeriod = (budget) => {
    const { targetAmount, currentAmount, targetDate } = budget;
    const remainingAmount = targetAmount - currentAmount;
    const now = new Date();
    const endDate = new Date(targetDate);
    const timeDiff = endDate - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    const monthsRemaining =
      (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth());

    if (remainingAmount <= 0) {
      return { weeklySavings: 0, monthlySavings: 0 };
    }

    const weeklySavings = weeksRemaining > 0 ? remainingAmount / weeksRemaining : remainingAmount;
    const monthlySavings = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
    return { weeklySavings, monthlySavings };
  };

  const handleDeleteBudget = async (budgetID) => {
    try {
      await api.delete(`/api/budgets/${budgetID}`);
      toast.success('Budget deleted successfully!');
      setBudgets((prev) => prev.filter((b) => b.budgetID !== budgetID));
    } catch (err) {
      console.error('Error deleting budget:', err.response?.data || err.message);
      toast.error(`Error deleting budget: ${err.response?.data?.error || err.message}`);
    }
  };

  const BudgetItem = ({ budget, className }) => {
    const [isShifted, setIsShifted] = useState(false);
    const budgetRef = useRef(null);

    const handleArrowClick = (e) => {
      e.stopPropagation();
      setIsShifted(!isShifted);
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      handleDeleteBudget(budget.budgetID);
    };

    const handleClickOutside = (e) => {
      if (budgetRef.current && !budgetRef.current.contains(e.target)) {
        setIsShifted(false);
      }
    };

    useEffect(() => {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, []);

    const savings = calculateSavingsPerPeriod(budget);

    return (
      <div ref={budgetRef} className={`budget-item ${isShifted ? 'shifted' : ''} ${className}`}>
        <div className="budget-content">
          <div className="budget-info">
            <label style={{ fontWeight: 'bold' }}>{budget.goalName}</label>
            <p>Account: {budget.accountName}</p>
            <ProgressBar progress={calculateProgress(budget)} />
            <p>Progress: {calculateProgress(budget)}%</p>
            <p>
              Save <strong>{currencySymbol(budget.currency || 'USD')}{savings.weeklySavings.toFixed(2)}</strong> per week or{' '}
              <strong>{currencySymbol(budget.currency || 'USD')}{savings.monthlySavings.toFixed(2)}</strong> per month to reach your
              goal by {new Date(budget.targetDate).toLocaleDateString('en-US')}
            </p>
          </div>
          <span className="budget-arrow" onClick={handleArrowClick}>
            &#x2190;
          </span>
        </div>
        <button
          className="budget-delete-button"
          onClick={handleDeleteClick}
          aria-label={`Delete budget ${budget.goalName}`}
        >
          X
        </button>
      </div>
    );
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    const { accountID, goalName } = newBudget;
    const targetAmount = parseFloat(rawAmount) / 100 || 0;

    if (dateDigits.length < 8) {
      setError('Invalid date. Please enter full MM/DD/YYYY.');
      return;
    }
    const mm = dateDigits.slice(0, 2);
    const dd = dateDigits.slice(2, 4);
    const yyyy = dateDigits.slice(4, 8);
    const targetDate = `${yyyy}-${mm}-${dd}`;

    if (!accountID || !goalName || !targetAmount || targetAmount <= 0 || dateDigits.length < 8) {
      setError('All fields are required and must be valid.');
      return;
    }

    const selectedDate = new Date(`${yyyy}-${mm}-${dd}`);
    if (selectedDate < today) {
      setError('Target date cannot be in the past.');
      return;
    }

    try {
      await api.post('/api/budgets/create', {
        accountID,
        goalName,
        targetAmount: targetAmount.toFixed(2),
        targetDate,
        currency,
      });
      setError('');
      toast.success('Budget created successfully!');
      const updatedBudgets = await api.get('/api/budgets', {
        params: { t: Date.now() },
      });
      setBudgets(updatedBudgets.data.budgets);
      setNewBudget({ accountID: '', goalName: '' });
      setRawAmount('');
      setDateDigits('');
      setCurrency('USD');
    } catch (err) {
      console.error('Error creating budget:', err.response?.data || err.message);
      setError('Failed to create budget.');
      toast.error('Failed to create budget.');
    }
  };

  return (
    <Card title="Budget Goals">
      <div className="budget-list">
        <TransitionGroup>
          {budgets.map((budget) => (
            <CSSTransition key={budget.budgetID} timeout={300} classNames="budget" unmountOnExit>
              <BudgetItem budget={budget} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      <form onSubmit={handleCreateBudget} className="budget-form">
        {error && <p className="error-message">{error}</p>}

        <label htmlFor="accountID">Account:</label>
        <select name="accountID" value={newBudget.accountID} onChange={handleInputChange} required>
          <option value="">Select account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.accountName}
            </option>
          ))}
        </select>

        <label htmlFor="goalName">Goal name:</label>
        <input
          type="text"
          name="goalName"
          value={newBudget.goalName}
          onChange={handleInputChange}
          placeholder="Enter goal name"
          required
        />

        <label htmlFor="targetAmount">Target amount:</label>
        <div className="amount-input-container" ref={currencyRef}>
          <div className="currency-selector" onClick={handleCurrencyClick}>
            {currencySymbol(currency)}
            <span className="currency-arrow">&#9662;</span>
            {showCurrencyDropdown && (
              <ul className="currency-dropdown">
                <li onClick={() => handleCurrencySelect('USD')}>{currencySymbol('USD')} USD</li>
                <li onClick={() => handleCurrencySelect('EUR')}>{currencySymbol('EUR')} EUR</li>
                <li onClick={() => handleCurrencySelect('GBP')}>{currencySymbol('GBP')} GBP</li>
                <li onClick={() => handleCurrencySelect('JPY')}>{currencySymbol('JPY')} JPY</li>
                <li onClick={() => handleCurrencySelect('CAD')}>{currencySymbol('CAD')} CAD</li>
                <li onClick={() => handleCurrencySelect('AUD')}>{currencySymbol('AUD')} AUD</li>
                <li onClick={() => handleCurrencySelect('CHF')}>{currencySymbol('CHF')} CHF</li>
                <li onClick={() => handleCurrencySelect('CNY')}>{currencySymbol('CNY')} CNY</li>
                <li onClick={() => handleCurrencySelect('INR')}>{currencySymbol('INR')} INR</li>
                <li onClick={() => handleCurrencySelect('BRL')}>{currencySymbol('BRL')} BRL</li>
              </ul>
            )}
          </div>
          <input
            type="text"
            value={formattedAmount}
            onChange={handleAmountChange}
            required
            placeholder="Enter amount"
            inputMode="numeric"
            className="amount-input"
          />
        </div>

        <label htmlFor="targetDate">Target date:</label>
        <div className="date-input-container">
          <input
            type="text"
            value={maskedDate}
            onChange={handleDateInputChange}
            placeholder="MM/DD/YYYY"
            className="date-input"
            inputMode="numeric"
            required
          />
          <input
            type="date"
            ref={hiddenDateRef}
            min={isoToday}
            style={{ display: 'none' }}
            onChange={handleHiddenDateChange}
          />
          <button type="button" className="calendar-button" onClick={openCalendar} aria-label="Open calendar">
            
          </button>
        </div>

        <button type="submit" className="glass-button">
          Add Budget
        </button>
      </form>
    </Card>
  );
};

export default BudgetCard;
