// src/components/AddExpense.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import './AddExpense.css'; // Create and style this CSS file

const AddExpense = () => {
  const { userID, token } = useAuth();
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

    try {
      const response = await axios.post(
        '/api/expenses/create',
        { userID, amount, description, categoryID },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === 'Expense added successfully') {
        setSuccess('Expense added successfully!');
        setError('');
        // Optionally, reset form fields
        setAmount('');
        setDescription('');
        setCategoryID('');
        // Redirect to Dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding expense:', err.response?.data || err.message);
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
          {/* Fetch categories from backend or define them statically */}
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
