// controllers/expenseController.js
const db = require('../config/dbConfig');
const asyncHandler = require('../middleware/asyncHandler');

// Add Expense
const addExpense = asyncHandler(async (req, res) => {
  const { userID, amount, description, categoryID, currency } = req.body;

  // Validate required fields (excluding currency since it's optional)
  if (!userID || amount === undefined || !description || categoryID === undefined) {
    return res.status(400).json({ error: 'Missing required fields: userID, amount, description, categoryID' });
  }

  // Optional: Validate currency if provided
  const allowedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
  if (currency && !allowedCurrencies.includes(currency)) {
    return res.status(400).json({ error: 'Invalid currency code.' });
  }

  // Validate that categoryID exists
  const [category] = await db.execute('SELECT * FROM Category WHERE categoryID = ?', [categoryID]);
  if (category.length === 0) {
    return res.status(400).json({ error: 'Invalid categoryID.' });
  }

  try {
    const query = 'INSERT INTO Expenses (userID, amount, description, categoryID, currency) VALUES (?, ?, ?, ?, ?)';
    await db.execute(query, [userID, amount, description, categoryID || null, currency || null]);
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
    const query = `
    SELECT e.*, c.name as categoryName 
    FROM Expenses e 
    LEFT JOIN Category c ON e.categoryID = c.categoryID 
    WHERE e.userID = ? 
    ORDER BY e.date DESC
  `;
    const [results] = await db.execute(query, [userID]);

    if (!results.length) {
      return res.status(200).json({ message: 'No expenses found.' });
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
    // Get total expenses from Expenses table
    const expensesQuery = 'SELECT SUM(amount) as totalExpenses FROM Expenses WHERE userID = ?';
    const [expensesResults] = await db.execute(expensesQuery, [userID]);
    const totalExpenses = expensesResults[0]?.totalExpenses || 0;

    // Get total transactions from Transactions table by joining with BankAccounts
    const transactionsQuery = `
    SELECT SUM(t.amount) as totalTransactions
    FROM Transactions t
    INNER JOIN BankAccounts b ON t.accountID = b.id
    WHERE b.userID = ? AND t.amount > 0
  `;
    const [transactionsResults] = await db.execute(transactionsQuery, [userID]);
    const totalTransactions = transactionsResults[0]?.totalTransactions || 0;

    const combinedTotal = parseFloat(totalExpenses) + parseFloat(totalTransactions);

    // Get upcoming subscriptions (assuming you have a Subscriptions table)
    const subscriptionsQuery = 'SELECT SUM(amount) as upcomingSubscriptions FROM Subscriptions WHERE userID = ?';
    const [subscriptionsResults] = await db.execute(subscriptionsQuery, [userID]);
    const upcomingSubscriptions = subscriptionsResults[0]?.upcomingSubscriptions || 0;

    res.status(200).json({ totalExpenses, totalTransactions, combinedTotal, upcomingSubscriptions });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ error: 'Server error fetching user metrics' });
  }
});

// Delete Expense
const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseID } = req.params;
  const { userID } = req.user; // Using req.user from authenticate.js middleware

  if (!expenseID) {
    return res.status(400).json({ error: 'expenseID is required' });
  }

  try {
    // First, check if the expense exists and belongs to the user
    const checkQuery = 'SELECT * FROM Expenses WHERE expenseID = ? AND userID = ?';
    const [checkResults] = await db.execute(checkQuery, [expenseID, userID]);

    if (!checkResults.length) {
      return res.status(404).json({ error: 'Expense not found or you do not have permission to delete it' });
    }

    // Delete the expense
    const deleteQuery = 'DELETE FROM Expenses WHERE expenseID = ?';
    await db.execute(deleteQuery, [expenseID]);

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Server error deleting expense' });
  }
});

// **New Function: Get Supported Currencies**
const getCurrencies = asyncHandler(async (req, res) => {
  try {
    // Define supported currencies
    const currencies = [
      { code: 'USD', symbol: '$' },
      { code: 'EUR', symbol: '€' },
      { code: 'GBP', symbol: '£' },
      { code: 'JPY', symbol: '¥' },
      { code: 'CAD', symbol: 'C$' },
      { code: 'AUD', symbol: 'A$' },
      { code: 'CHF', symbol: 'CHF' },
      { code: 'CNY', symbol: '¥' },
      { code: 'INR', symbol: '₹' },
      { code: 'BRL', symbol: 'R$' },
      // Add more currencies as needed
    ];

    res.status(200).json({ currencies });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Server error fetching currencies' });
  }
});

module.exports = { addExpense, getExpenses, getUserMetrics, deleteExpense, getCurrencies };