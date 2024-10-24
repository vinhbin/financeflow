const express = require('express');
const { createLinkToken, exchangePublicToken, getTransactions } = require('../controllers/plaidController');
const router = express.Router();

router.post('/create-link-token', createLinkToken);  // For generating Plaid link token
router.post('/exchange-public-token', exchangePublicToken);  // For exchanging the public token for access token
router.get('/transactions/:userID', getTransactions);  // For getting transactions for a user

module.exports = router;
