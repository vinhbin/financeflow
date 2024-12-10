// routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { createBudget, getUserBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const authenticate = require('../middleware/authenticate');

// Route to create a new budget
router.post('/create', authenticate, createBudget);

// Route to get all budgets for a user
router.get('/', authenticate, getUserBudgets);

// Route to update a budget
router.put('/:budgetID', authenticate, updateBudget);

// Route to delete a budget
router.delete('/:budgetID', authenticate, deleteBudget);

module.exports = router;
