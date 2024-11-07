// routes/plaidRoutes.js
const express = require('express');
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken,
  getLinkedAccounts,
  getTransactions,
  deleteBankAccount,
} = require('../controllers/plaidController');
const authenticate = require('../middleware/authenticate'); // Ensure this middleware exists

// Route to create a link token
router.post('/link-token', authenticate, createLinkToken);

// Route to exchange public token for access token
router.post('/exchange-token', authenticate, exchangePublicToken);

// Route to get linked bank accounts for a user
router.get('/accounts/:userID', authenticate, getLinkedAccounts);

// Route to get transactions for a user
router.get('/transactions/:userID', authenticate, getTransactions);

// Route to unlink a bank account
router.delete('/accounts/:accountID', authenticate, deleteBankAccount);

module.exports = router;
