// src/components/AddExpense.js
import React, { useState } from 'react';
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
  const [error, setError] = useState('');

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
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyDropdown(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!rawAmount || !description || !categoryID) {
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
        currency, // Include currency if backend supports it
      });

      console.log('Response from server:', response.data); // Debugging log

      if (response.data.message === 'Expense added successfully') {
        toast.success('Expense added successfully!');
        setError('');
        setRawAmount('');
        setFormattedAmount('');
        setDescription('');
        setCategoryID('');

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
      <div className="amount-input-container">
        <div className="currency-selector" onClick={handleCurrencyClick}>
          {currencySymbol(currency)}
          {showCurrencyDropdown && (
            <ul className="currency-dropdown">
              <li onClick={() => handleCurrencySelect('USD')}>{currencySymbol('USD')} USD</li>
              <li onClick={() => handleCurrencySelect('EUR')}>{currencySymbol('EUR')} EUR</li>
              <li onClick={() => handleCurrencySelect('GBP')}>{currencySymbol('GBP')} GBP</li>
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
      <select
        id="category"
        value={categoryID}
        onChange={(e) => setCategoryID(e.target.value)}
        required
        className="category-select"
      >
        <option value="">Select Category</option>
        <option value="1">Food</option>
        <option value="2">Transportation</option>
        <option value="3">Utilities</option>
        <option value="4">Entertainment</option>
        <option value="5">Health</option>
        <option value="6">Other</option>
        {/* Add other categories as needed */}
      </select>

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
    // Add more currencies as needed
    default:
      return '$';
  }
};

export default AddExpense;
