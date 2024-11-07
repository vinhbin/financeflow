// src/components/AddExpense.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../utils/api'; // Import the custom API module
import './AddExpense.css'; // Ensure this CSS file is created and styled

const AddExpense = () => {
  const { userID } = useAuth(); // Ensure `token` is handled via `api.js` interceptor
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!amount || !description || !categoryID) {
      setError('All fields are required.');
      return;
    }

    console.log('Preparing to send expense data:', { userID, amount, description, categoryID }); // Debugging log

    try {
      const response = await api.post('/api/expenses/create', {
        userID,
        amount,
        description,
        categoryID,
      });

      console.log('Response from server:', response.data); // Debugging log

      if (response.data.message === 'Expense added successfully') {
        setSuccess('Expense added successfully!');
        setError('');
        setAmount('');
        setDescription('');
        setCategoryID('');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding expense:', err.response || err.message);
      setError(err.response?.data?.error || 'Failed to add expense.');
      setSuccess('');
    }
  };

  return (
    <div className="add-expense-container">
      <h2>Add New Expense</h2>
      <form onSubmit={handleAddExpense} className="add-expense-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          step="0.01"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={categoryID}
          onChange={(e) => setCategoryID(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="1">Food</option>
          <option value="2">Transportation</option>
          <option value="3">Utilities</option>
          {/* Add other categories as needed */}
        </select>

        <button type="submit" className="submit-button">Add Expense</button>
      </form>
    </div>
  );
};

export default AddExpense;
