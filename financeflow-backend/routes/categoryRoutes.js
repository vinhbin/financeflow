// routes/categoryRoutes.js
const router = require('express').Router();

// Import the controller functions
const { createCategory, getUserCategories } = require('../controllers/categoryController');

// Route to create a new category
router.post('/create', createCategory);

// Route to get all categories for a user
router.get('/user/:userID', getUserCategories);

module.exports = router;
