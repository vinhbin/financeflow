const db = require('../config/dbConfig');
const mysql = require('mysql2/promise');

const addExpense = (req, res) => {
  const { userID, amount, description, categoryID } = req.body; // Extract values from the request body
  
  // Validate inputs
  if (!userID || amount === undefined || !description || categoryID === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = 'INSERT INTO Expenses (userID, amount, description, categoryID) VALUES (?, ?, ?, ?)';
  db.execute(query, [userID, amount, description, categoryID], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Expense added successfully' });
  });
};


// Get all expenses for a specific user
const getExpenses = async (req, res) => {
  const { userID } = req.params;

  let connection;
  try {
    connection = await db.getConnection();
    const [results] = await connection.execute('SELECT * FROM Expenses WHERE userID = ?', [userID]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get user metrics (total expenses and upcoming subscriptions)
const getUserMetrics = async (req, res) => {
  const { userID } = req.params;

  let connection;
  try {
    connection = await db.getConnection();
    const [expenseResults] = await connection.execute('SELECT SUM(amount) as totalExpenses FROM Expenses WHERE userID = ?', [userID]);
    const totalExpenses = expenseResults[0].totalExpenses || 0;

    const [subsResults] = await connection.execute('SELECT SUM(amount) as upcomingSubscriptions FROM Subscriptions WHERE userID = ?', [userID]);
    const upcomingSubscriptions = subsResults[0].upcomingSubscriptions || 0;

    res.json({ totalExpenses, upcomingSubscriptions });
  } catch (err) {
    console.error('Error fetching user metrics:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { addExpense };
