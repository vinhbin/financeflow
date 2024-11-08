// routes/aiInsightRoutes.js
const express = require('express');
const { generateAIInsight } = require('../controllers/aiInsightController');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); // Use your existing authenticate middleware

// POST route for generating AI financial insights
router.post('/generate', authenticate, generateAIInsight);

module.exports = router;
