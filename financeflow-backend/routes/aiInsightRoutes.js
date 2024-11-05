//aiInsightRoutes.js
const express = require('express');
const { generateAIInsight } = require('../controllers/aiInsightController');
const router = express.Router();

// POST route for generating AI financial insights
router.post('/generate', generateAIInsight);

module.exports = router;
