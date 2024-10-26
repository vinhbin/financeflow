import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/expenses/user/1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
    };

    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const newExpense = { description, amount: parseFloat(amount) };
    const response = await axios.post(`${API_BASE_URL}/api/expenses`, newExpense, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses([...expenses, response.data]);
    setDescription('');
    setAmount('');
  };

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