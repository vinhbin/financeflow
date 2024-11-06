// controllers/plaidController.js
const plaid = require('plaid');
const db = require('../config/dbConfig');
const asyncHandler = require('../middleware/asyncHandler');
const config = require('../config/config');

// Validate environment variables
if (!config.plaidEnv || !config.plaidClientId || !config.plaidSecret) {
  throw new Error('Missing necessary environment variables for Plaid configuration');
}

const plaidClient = new plaid.PlaidApi(
  new plaid.Configuration({
    basePath: plaid.PlaidEnvironments[config.plaidEnv],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.plaidClientId,
        'PLAID-SECRET': config.plaidSecret,
      },
    },
  })
);

// Create Link Token
const createLinkToken = asyncHandler(async (req, res) => {
  const { userID } = req.body;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userID.toString() },
      client_name: 'FinanceFlow App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// Exchange Public Token
const exchangePublicToken = asyncHandler(async (req, res) => {
  const { public_token, userID } = req.body;
  if (!public_token || !userID) {
    return res.status(400).json({ error: 'public_token and userID are required' });
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;

    // Optionally, fetch account details to get accountName
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    const accountName = accountsResponse.data.accounts[0]?.name || 'Default Account';

    const query = 'INSERT INTO BankAccounts (userID, accessToken, accountName) VALUES (?, ?, ?)';
    await db.execute(query, [userID, accessToken, accountName]);

    res.status(201).json({ message: 'Bank account linked successfully' });
  } catch (error) {
    console.error('Error exchanging public token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
});

// Get Linked Accounts
const getLinkedAccounts = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const [results] = await db.execute('SELECT * FROM BankAccounts WHERE userID = ?', [userID]);
    if (results.length === 0) {
      return res.status(200).json({ message: 'No linked bank accounts found' });
    }
    res.status(200).json({ accounts: results });
  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    res.status(500).json({ error: 'Server error fetching linked accounts' });
  }
});

// Get Transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const [results] = await db.execute('SELECT accessToken FROM BankAccounts WHERE userID = ?', [userID]);
    if (!results.length) {
      return res.status(200).json({ message: 'No linked bank account found. Please link a bank account first.' });
    }

    const accessToken = results[0].accessToken;

    // Dynamic Date Range: Last 1 Year
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: lastYear.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
    });

    if (response.data.transactions.length === 0) {
      return res.status(200).json({ message: 'No transactions found for the specified period.' });
    }

    res.status(200).json({ transactions: response.data.transactions });
  } catch (error) {
    console.error('Error fetching transactions from Plaid:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch transactions. Please try again later.' });
  }
});

module.exports = { createLinkToken, exchangePublicToken, getLinkedAccounts, getTransactions };
