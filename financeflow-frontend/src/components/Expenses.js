// src/components/Expenses.js
import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';
import api from '../utils/api';

const Expenses = ({ userID }) => {
  const { data: expenses, loading, error } = useFetch(`/api/expenses/user/${userID}`);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const newExpense = { description, amount: parseFloat(amount) };
      await api.post('/api/expenses', newExpense, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDescription('');
      setAmount('');
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  if (loading) return <p>Loading expenses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Your Expenses</h2>
      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <button type="submit">Add Expense</button>
      </form>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.expenseID}>{expense.description}: ${expense.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses;
