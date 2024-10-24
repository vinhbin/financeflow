const plaid = require('plaid');
require('dotenv').config();
const db = require('../config/dbConfig');

const configuration = new plaid.Configuration({
    basePath: plaid.PlaidEnvironments[process.env.PLAID_ENV], // Ensure this is correct
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new plaid.PlaidApi(configuration);

// Your existing functions for createLinkToken, exchangePublicToken, getTransactions, etc.


// Create Plaid Link Token
const createLinkToken = async (req, res) => {
  const { userID } = req.body;

  try {
    const response = await plaidClient.createLinkToken({
      user: {
        client_user_id: userID,
      },
      client_name: 'FinanceFlow App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Could not create link token' });
  }
};

// Exchange Plaid Public Token for Access Token
const exchangePublicToken = async (req, res) => {
  const { public_token, userID } = req.body;

  try {
    const response = await plaidClient.exchangePublicToken(public_token);
    const accessToken = response.access_token;
    const itemID = response.item_id;

    // Store accessToken and itemID in the database for future use
    const query = 'INSERT INTO BankAccounts (userID, accessToken, itemID) VALUES (?, ?, ?)';
    db.execute(query, [userID, accessToken, itemID], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Bank account linked successfully', accessToken });
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: 'Could not exchange public token' });
  }
};

// Fetch Transactions
const getTransactions = async (req, res) => {
  const { userID } = req.params;

  db.execute('SELECT accessToken FROM BankAccounts WHERE userID = ?', [userID], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: 'No linked bank account found' });

    const accessToken = results[0].accessToken;

    try {
      const response = await plaidClient.getTransactions(accessToken, '2024-01-01', '2024-12-31');
      res.json({ transactions: response.transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Could not fetch transactions' });
    }
  });
};

module.exports = { createLinkToken, exchangePublicToken, getTransactions };
