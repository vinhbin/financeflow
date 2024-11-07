// controllers/expenseController.js
const db = require('../config/dbConfig');
const asyncHandler = require('../middleware/asyncHandler');

// Wrap db.execute in a Promise to use async/await
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Add Expense
const addExpense = asyncHandler(async (req, res) => {
  const { userID, amount, description, categoryID } = req.body;

  if (!userID || amount === undefined || !description || categoryID === undefined) {
    return res.status(400).json({ error: 'Missing required fields: userID, amount, description, categoryID' });
  }

  try {
    const query = 'INSERT INTO Expenses (userID, amount, description, categoryID) VALUES (?, ?, ?, ?)';
    await executeQuery(query, [userID, amount, description, categoryID || null]);
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Server error adding expense' });
  }
});

// Get Expenses
const getExpenses = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const query = 'SELECT e.*, c.name as categoryName FROM Expenses e LEFT JOIN Category c ON e.categoryID = c.categoryID WHERE e.userID = ? ORDER BY e.date DESC';
    const results = await executeQuery(query, [userID]);

    if (!results.length) {
      return res.status(200).json({ message: 'No expenses found for this user.' });
    }

    res.status(200).json({ expenses: results });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
});

// Get User Metrics
const getUserMetrics = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const expensesQuery = 'SELECT SUM(amount) as totalExpenses FROM Expenses WHERE userID = ?';
    const expensesResults = await executeQuery(expensesQuery, [userID]);
    const totalExpenses = expensesResults[0]?.totalExpenses || 0;

    const transactionsQuery = 'SELECT SUM(amount) as totalTransactions FROM Transactions WHERE userID = ? AND amount > 0';
    const transactionsResults = await executeQuery(transactionsQuery, [userID]);
    const totalTransactions = transactionsResults[0]?.totalTransactions || 0;

    const combinedTotal = totalExpenses + totalTransactions;

    const subscriptionsQuery = 'SELECT SUM(amount) as upcomingSubscriptions FROM Subscriptions WHERE userID = ?';
    const subscriptionsResults = await executeQuery(subscriptionsQuery, [userID]);
    const upcomingSubscriptions = subscriptionsResults[0]?.upcomingSubscriptions || 0;

    res.status(200).json({ totalExpenses, totalTransactions, combinedTotal, upcomingSubscriptions });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ error: 'Server error fetching user metrics' });
  }
});

module.exports = { addExpense, getExpenses, getUserMetrics };
