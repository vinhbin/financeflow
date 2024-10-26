const express = require('express');
const db = require('../config/dbConfig');
const app = express();

app.use(express.json());

// Function to create a new category
const createCategory = async (req, res) => {
    try {
        const { userID, categoryName } = req.body;

        const query = 'INSERT INTO Categories (userID, categoryName) VALUES (?, ?)';
        await db.execute(query, [userID, categoryName]);

        res.status(201).json({
            success: true,
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};

// Function to get all categories for a user
const getUserCategories = async (req, res) => {
    try {
        const { userID } = req.params;

        const [results] = await db.execute('SELECT * FROM Categories WHERE userID = ?', [userID]);

        res.status(200).json({
            success: true,
            categories: results
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories',
            error: error.message
        });
    }
};

// Define routes
app.post('/categories', createCategory);
app.get('/categories/:userID', getUserCategories);


module.exports = { createCategory, getUserCategories };

  