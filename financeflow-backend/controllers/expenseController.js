const db = require('../config/dbConfig');

const addExpense = (req, res) => {
  const { userID, amount, description, categoryID } = req.body;

  // Check if any required parameter is missing or undefined
  if (!userID || amount === undefined || !description || categoryID === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO Expenses (userID, amount, description, categoryID) VALUES (?, ?, ?, ?)';
  db.execute(query, [userID, amount, description, categoryID || null], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Expense added successfully' });
  });
};


const getExpenses = (req, res) => {
  const { userID } = req.params;

  db.execute('SELECT * FROM Expenses WHERE userID = ?', [userID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getUserMetrics = (req, res) => {
  const { userID } = req.params;

  db.execute('SELECT SUM(amount) as totalExpenses FROM Expenses WHERE userID = ?', [userID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalExpenses = results[0].totalExpenses || 0;

    db.execute('SELECT SUM(amount) as upcomingSubscriptions FROM Subscriptions WHERE userID = ?', [userID], (err, subsResults) => {
      if (err) return res.status(500).json({ error: err.message });

      const upcomingSubscriptions = subsResults[0].upcomingSubscriptions || 0;
      res.json({ totalExpenses, upcomingSubscriptions });
    });
  });
};

module.exports = { addExpense, getExpenses, getUserMetrics };
