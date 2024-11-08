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

// Exchange Public Token and Save Transactions
const exchangePublicToken = asyncHandler(async (req, res) => {
  const { public_token, userID } = req.body;
  if (!public_token || !userID) {
    return res.status(400).json({ error: 'public_token and userID are required' });
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;

    // Fetch account details
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    const accounts = accountsResponse.data.accounts;

    // Save each account and its transactions
    for (const account of accounts) {
      const accountName = account.name || 'Default Account';

      // Insert account into BankAccounts
      const [result] = await db.execute(
        'INSERT INTO BankAccounts (userID, accessToken, accountName) VALUES (?, ?, ?)',
        [userID, accessToken, accountName]
      );

      const accountID = result.insertId;

      // Define date range for transactions (e.g., last 60 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 60);

      // Fetch transactions from Plaid
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        options: {
          count: 500, // Adjust as needed
          offset: 0,
        },
      });

      const transactions = transactionsResponse.data.transactions;

      // Save transactions to Transactions table
      for (const txn of transactions) {
        // Check if the transaction already exists to prevent duplicates
        const [existingTxn] = await db.execute(
          'SELECT * FROM Transactions WHERE plaidTransactionID = ?',
          [txn.transaction_id]
        );

        if (existingTxn.length === 0) {
          await db.execute(
            'INSERT INTO Transactions (accountID, plaidTransactionID, amount, description, category, date) VALUES (?, ?, ?, ?, ?, ?)',
            [
              accountID,
              txn.transaction_id, // Assuming you have a plaidTransactionID field
              txn.amount,
              txn.name || 'No Description',
              txn.category && txn.category.length > 0 ? txn.category[0] : 'Uncategorized',
              txn.date,
            ]
          );
        }
      }
    }

    res.status(201).json({ message: 'Bank account linked successfully and transactions saved' });
  } catch (error) {
    console.error('Error exchanging public token and saving transactions:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange public token and save transactions' });
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

// Get Transactions from Database
const getTransactions = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  console.log(`Fetching transactions for userID: ${userID}`); // Debugging

  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    // Fetch all bank accounts for the user
    const [accounts] = await db.execute('SELECT id FROM BankAccounts WHERE userID = ?', [userID]);
    console.log(`Fetched accounts: ${JSON.stringify(accounts)}`); // Debugging

    if (accounts.length === 0) {
      return res.status(200).json({ message: 'No linked bank account found. Please link a bank account first.' });
    }

    const accountIds = accounts.map(acc => acc.id);
    console.log(`Account IDs: ${accountIds}`); // Debugging

    // Dynamically generate placeholders for the IN clause
    const placeholders = accountIds.map(() => '?').join(',');
    const query = `SELECT * FROM Transactions WHERE accountID IN (${placeholders}) ORDER BY date DESC LIMIT 60`;

    // Execute the query with accountIds as separate parameters
    const [transactions] = await db.execute(query, accountIds);
    console.log(`Fetched transactions: ${JSON.stringify(transactions)}`); // Debugging

    res.status(200).json({ transactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// Unlink a Bank Account
const deleteBankAccount = asyncHandler(async (req, res) => {
  const { accountID } = req.params;
  const { userID } = req.user; // assuming userID is in req.user from authenticate middleware

  if (!accountID) {
    return res.status(400).json({ error: 'accountID is required' });
  }

  try {
    // Verify that the account belongs to the user
    const [accounts] = await db.execute('SELECT * FROM BankAccounts WHERE id = ? AND userID = ?', [accountID, userID]);
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    const accessToken = accounts[0].accessToken;

    // Optionally, revoke access token with Plaid if needed
    // Not implemented here

    // Delete associated transactions
    await db.execute('DELETE FROM Transactions WHERE accountID = ?', [accountID]);

    // Delete the bank account
    await db.execute('DELETE FROM BankAccounts WHERE id = ?', [accountID]);

    res.status(200).json({ message: 'Bank account and associated transactions unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking bank account:', error);
    res.status(500).json({ error: 'Failed to unlink bank account' });
  }
});

// Update Transactions (Scheduled Task)
const updateTransactions = asyncHandler(async () => {
  try {
    // Fetch all users
    const [users] = await db.execute('SELECT userID FROM Users');

    for (const user of users) {
      const userID = user.userID;

      // Fetch all bank accounts for the user
      const [accounts] = await db.execute('SELECT id, accessToken FROM BankAccounts WHERE userID = ?', [userID]);

      for (const account of accounts) {
        const { id: accountID, accessToken } = account;

        // Define date range (e.g., last 60 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 60);

        // Fetch transactions from Plaid
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: accessToken,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          options: {
            count: 500,
            offset: 0,
          },
        });

        const transactions = transactionsResponse.data.transactions;

        // Save new transactions to the Transactions table
        for (const txn of transactions) {
          // Check if the transaction already exists to prevent duplicates
          const [existingTxn] = await db.execute(
            'SELECT * FROM Transactions WHERE plaidTransactionID = ?',
            [txn.transaction_id]
          );

          if (existingTxn.length === 0) {
            await db.execute(
              'INSERT INTO Transactions (accountID, plaidTransactionID, amount, description, category, date) VALUES (?, ?, ?, ?, ?, ?)',
              [
                accountID,
                txn.transaction_id,
                txn.amount,
                txn.name || 'No Description',
                txn.category && txn.category.length > 0 ? txn.category[0] : 'Uncategorized',
                txn.date,
              ]
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating transactions:', error);
    // Depending on your cron job setup, you might want to handle retries or alerts here
  }
});

module.exports = { createLinkToken, exchangePublicToken, getLinkedAccounts, getTransactions, deleteBankAccount, updateTransactions };
