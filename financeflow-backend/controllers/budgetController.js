// controllers/budgetController.js
const db = require('../config/dbConfig');
const asyncHandler = require('../middleware/asyncHandler');

// Create Budget
const createBudget = asyncHandler(async (req, res) => {
  const { userID } = req.user;
  const { accountID, goalName, targetAmount, targetDate, currency } = req.body;

  // Validate required fields, now including currency
  if (!accountID || !goalName || !targetAmount || !targetDate || !currency) {
    return res.status(400).json({ error: 'All fields (accountID, goalName, targetAmount, targetDate, currency) are required' });
  }

  // Optional: Validate currency if you want to restrict to certain codes
  const allowedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
  if (!allowedCurrencies.includes(currency)) {
    return res.status(400).json({ error: 'Invalid currency code.' });
  }

  try {
    const query = 'INSERT INTO Budgets (userID, accountID, goalName, targetAmount, targetDate, currency) VALUES (?, ?, ?, ?, ?, ?)';
    await db.execute(query, [userID, accountID, goalName, targetAmount, targetDate, currency]);
    return res.status(201).json({ message: 'Budget created successfully' });
  } catch (error) {
    console.error('Error creating budget:', error);
    return res.status(500).json({ error: 'Server error creating budget' });
  }
});

// Get User Budgets
const getUserBudgets = asyncHandler(async (req, res) => {
  const { userID } = req.user;

  try {
    // Since we added currency to the Budgets table, it will be included in b.*
    const query = 'SELECT b.*, ba.accountName FROM Budgets b INNER JOIN BankAccounts ba ON b.accountID = ba.id WHERE b.userID = ?';
    const [results] = await db.execute(query, [userID]);

    return res.status(200).json({ budgets: results });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return res.status(500).json({ error: 'Server error fetching budgets' });
  }
});

// Update Budget (optional, unchanged)
const updateBudget = asyncHandler(async (req, res) => {
  const { userID } = req.user;
  const { budgetID } = req.params;
  const { currentAmount } = req.body;

  if (currentAmount === undefined) {
    return res.status(400).json({ error: 'currentAmount is required' });
  }

  try {
    const query = 'UPDATE Budgets SET currentAmount = ? WHERE budgetID = ? AND userID = ?';
    const [result] = await db.execute(query, [currentAmount, budgetID, userID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found or you do not have permission to update it' });
    }

    return res.status(200).json({ message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Error updating budget:', error);
    return res.status(500).json({ error: 'Server error updating budget' });
  }
});

// Delete Budget (optional, unchanged)
const deleteBudget = asyncHandler(async (req, res) => {
  const { userID } = req.user;
  const { budgetID } = req.params;

  try {
    const query = 'DELETE FROM Budgets WHERE budgetID = ? AND userID = ?';
    const [result] = await db.execute(query, [budgetID, userID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found or you do not have permission to delete it' });
    }

    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return res.status(500).json({ error: 'Server error deleting budget' });
  }
});

module.exports = { createBudget, getUserBudgets, updateBudget, deleteBudget };
