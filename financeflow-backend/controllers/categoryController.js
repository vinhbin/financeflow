//categoryController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../config/dbConfig');

const createCategory = asyncHandler(async (req, res) => {
  const { userID, categoryName } = req.body;
  if (!userID || !categoryName) {
    return res.status(400).json({ error: 'userID and categoryName are required' });
  }

  const query = 'INSERT INTO Categories (userID, categoryName) VALUES (?, ?)';
  await db.execute(query, [userID, categoryName]);

  res.status(201).json({ message: 'Category created successfully' });
});

const getUserCategories = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  const [results] = await db.execute('SELECT * FROM Categories WHERE userID = ?', [userID]);
  res.status(200).json({ categories: results });
});

module.exports = { createCategory, getUserCategories };
