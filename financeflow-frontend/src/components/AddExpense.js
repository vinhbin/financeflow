// src/components/AddExpense.js
import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../utils/api'; // Import the custom API module
import './AddExpense.css'; // Ensure this CSS file is created and styled
import { toast } from 'react-toastify'; // Import toast for notifications

const AddExpense = ({ onExpenseAdded }) => {
  const { userID } = useAuth(); // Ensure `token` is handled via `api.js` interceptor

  const [rawAmount, setRawAmount] = useState(''); // Raw amount input as string
  const [formattedAmount, setFormattedAmount] = useState(''); // Formatted amount displayed in input

  const [description, setDescription] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [currency, setCurrency] = useState('USD'); // Default currency
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false); // State to control currency dropdown visibility
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // State to control category dropdown visibility
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]); // State to hold fetched categories

  // Fetch categories from the backend when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/user/' + userID);
        if (response.data.categories) {
          setCategories(response.data.categories);
        } else {
          toast.error('Failed to fetch categories.');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error fetching categories.');
      }
    };

    fetchCategories();
  }, [userID]);

  const handleAmountChange = (e) => {
    const input = e.target.value;

    // Remove any non-digit characters
    const digits = input.replace(/\D/g, '');

    // Limit the input to 10 digits (for a maximum amount of 9999999999, which becomes 99999999.99)
    const limitedDigits = digits.slice(0, 10);

    setRawAmount(limitedDigits);

    // Convert the digits to a number and format
    const amountNumber = parseFloat(limitedDigits) / 100;
    // Format to two decimal places
    const formatted = amountNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    setFormattedAmount(formatted);
  };

  const handleCurrencyClick = () => {
    setShowCurrencyDropdown(!showCurrencyDropdown);
    setShowCategoryDropdown(false); // Close category dropdown if open
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyDropdown(false);
  };

  const handleCategoryClick = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowCurrencyDropdown(false); // Close currency dropdown if open
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategoryID(selectedCategory.categoryID); // Use categoryID as per database
    setShowCategoryDropdown(false);
  };

  // Close dropdowns when clicking outside
  const currencyRef = useRef();
  const categoryRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!rawAmount || !description || !categoryID || !currency) {
      setError('All fields are required.');
      return;
    }

    // Convert rawAmount to actual amount in decimal
    const amount = parseFloat(rawAmount) / 100;

    // Check if amount exceeds the maximum allowed by the database
    if (amount > 99999999.99) {
      setError('Amount exceeds maximum allowed value.');
      return;
    }

    console.log('Preparing to send expense data:', { userID, amount, description, categoryID, currency }); // Debugging log

    try {
      const response = await api.post('/api/expenses/create', {
        userID,
        amount,
        description,
        categoryID,
        currency, // Include currency as the backend now supports it
      });

      console.log('Response from server:', response.data); // Debugging log

      if (response.data.message === 'Expense added successfully') {
        toast.success('Expense added successfully!');
        setError('');
        setRawAmount('');
        setFormattedAmount('');
        setDescription('');
        setCategoryID('');
        setCurrency('USD'); // Reset to default currency

        // Trigger the refresh of expenses data
        if (onExpenseAdded) {
          onExpenseAdded();
        }
      }
    } catch (err) {
      console.error('Error adding expense:', err.response || err.message);
      setError(err.response?.data?.error || 'Failed to add expense.');
      toast.error(`Error adding expense: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <form onSubmit={handleAddExpense} className="add-expense-form">
      {error && <p className="error-message">{error}</p>}

      <label htmlFor="amount">Amount:</label>
      <div className="amount-input-container" ref={currencyRef}>
        <div className="currency-selector" onClick={handleCurrencyClick}>
          {currencySymbol(currency)}
          <span className="currency-arrow">&#9662;</span> {/* Down arrow indicator */}
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
              {/* Add more currencies as needed */}
            </ul>
          )}
        </div>
        <input
          type="text"
          id="amount"
          value={formattedAmount}
          onChange={handleAmountChange}
          required
          placeholder="Enter amount"
          inputMode="numeric"
          className="amount-input"
        />
      </div>

      <label htmlFor="description">Description:</label>
      <input
        type="text"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        placeholder="Enter description"
      />

      <label htmlFor="category">Category:</label>
      <div className="category-selector" onClick={handleCategoryClick} ref={categoryRef}>
        {categoryID ? categories.find((cat) => cat.categoryID === categoryID)?.name : 'Select Category'}
        <span className="category-arrow">&#9662;</span> {/* Down arrow indicator */}
        {showCategoryDropdown && (
          <ul className="category-dropdown">
            {categories.map((cat) => (
              <li key={cat.categoryID} onClick={() => handleCategorySelect(cat)}>
                {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" className="glass-button">
        Add Expense
      </button>
    </form>
  );
};

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
    // Add more currencies as needed
    default:
      return '$';
  }
};

export default AddExpense;
