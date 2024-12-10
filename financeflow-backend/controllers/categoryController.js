// controllers/categoryController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../config/dbConfig');

// Helper function to capitalize words
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Create Category
const createCategory = asyncHandler(async (req, res) => {
  const { userID, categoryName } = req.body;

  if (!userID || !categoryName) {
    return res.status(400).json({ error: 'userID and categoryName are required' });
  }

  try {
    // Check if category already exists globally (since Category table doesn't have userID)
    const [existingCategories] = await db.execute(
      'SELECT * FROM Category WHERE LOWER(name) = LOWER(?)',
      [categoryName]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const query = 'INSERT INTO Category (name) VALUES (?)';
    await db.execute(query, [capitalizeWords(categoryName.trim())]);

    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error creating category' });
  }
});

// Get User Categories
const getUserCategories = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    // Since Category table doesn't have userID, assume categories are global
    const query = 'SELECT * FROM Category ORDER BY name ASC';
    const [results] = await db.execute(query);

    if (!results.length) {
      return res.status(200).json({ message: 'No categories available.' });
    }

    res.status(200).json({ categories: results });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

module.exports = { createCategory, getUserCategories };
