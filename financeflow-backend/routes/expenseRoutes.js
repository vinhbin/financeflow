// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, getUserMetrics, deleteExpense, getCurrencies } = require('../controllers/expenseController');
const authenticate = require('../middleware/authenticate'); // Use your existing authenticate middleware

// Route to add a new expense
router.post('/create', authenticate, addExpense);

// Route to get all expenses for a specific user
router.get('/user/:userID', authenticate, getExpenses);

// Route to get key metrics for a user
router.get('/metrics/:userID', authenticate, getUserMetrics);

// Route to delete an expense
router.delete('/:expenseID', authenticate, deleteExpense);

// **New Route: Get Supported Currencies**
router.get('/currency', authenticate, getCurrencies);

module.exports = router;