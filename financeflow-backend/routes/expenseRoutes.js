// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, getUserMetrics } = require('../controllers/expenseController');

// Route to add a new expense
router.post('/create', addExpense);

// Route to get all expenses for a specific user
router.get('/user/:userID', getExpenses);

// Route to get key metrics for a user
router.get('/metrics/:userID', getUserMetrics);

module.exports = router;
