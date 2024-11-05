//categoryRoutes.js
// Pseudo code for category routes

const router = require('express').Router();

// Route to create a new category
router.post('/create', createCategory);

// Route to get all categories for a user
router.get('/user/:userID', getUserCategories);

module.exports = router;
