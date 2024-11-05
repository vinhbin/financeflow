//expenseController.js
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
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO Expenses (userID, amount, description, categoryID) VALUES (?, ?, ?, ?)';
  await executeQuery(query, [userID, amount, description, categoryID || null]);
  res.status(201).json({ message: 'Expense added successfully' });
});

// Get Expenses
const getExpenses = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  const query = 'SELECT * FROM Expenses WHERE userID = ?';
  const results = await executeQuery(query, [userID]);
  res.json(results);
});

// Get User Metrics
const getUserMetrics = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  const expensesQuery = 'SELECT SUM(amount) as totalExpenses FROM Expenses WHERE userID = ?';
  const expensesResults = await executeQuery(expensesQuery, [userID]);
  const totalExpenses = expensesResults[0].totalExpenses || 0;

  const subscriptionsQuery = 'SELECT SUM(amount) as upcomingSubscriptions FROM Subscriptions WHERE userID = ?';
  const subscriptionsResults = await executeQuery(subscriptionsQuery, [userID]);
  const upcomingSubscriptions = subscriptionsResults[0].upcomingSubscriptions || 0;

  res.json({ totalExpenses, upcomingSubscriptions });
});

module.exports = { addExpense, getExpenses, getUserMetrics };
