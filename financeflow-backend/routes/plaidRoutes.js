//plaidRoutes.js
const express = require('express');
const router = express.Router();
const { createLinkToken, exchangePublicToken, getLinkedAccounts, getTransactions } = require('../controllers/plaidController');

// Ensure all route handlers are properly imported and defined
router.post('/link-token', createLinkToken);
router.post('/exchange-token', exchangePublicToken);
router.get('/accounts/:userID', getLinkedAccounts);
router.get('/transactions/:userID', getTransactions);

module.exports = router;
