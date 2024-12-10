// routes/challengeRoutes.js
const express = require('express');
const router = express.Router();
const { generateWeeklyChallenge, getUserChallenges, completeChallenge, deleteAllChallenges } = require('../controllers/challengeController');
const authenticate = require('../middleware/authenticate');

router.post('/generate', authenticate, generateWeeklyChallenge);
router.get('/', authenticate, getUserChallenges);
router.put('/:challengeID/complete', authenticate, completeChallenge);
router.delete('/delete-all', authenticate, deleteAllChallenges);

module.exports = router;
