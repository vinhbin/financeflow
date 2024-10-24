const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, getUserMetrics } = require('../controllers/expenseController');

// POST: Create a new expense
router.post('/create', addExpense);

// GET: Get all expenses for a specific user
router.get('/:userID', getExpenses);

// GET: Get user metrics (total expenses and subscriptions)
router.get('/metrics/:userID', getUserMetrics);

module.exports = router;
