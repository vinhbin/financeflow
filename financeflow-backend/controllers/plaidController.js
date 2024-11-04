const plaid = require('plaid');
const db = require('../config/dbConfig');
const asyncHandler = require('../middleware/asyncHandler');

const config = {
    plaidEnv: process.env.PLAID_ENV,
    plaidClientId: process.env.PLAID_CLIENT_ID,
    plaidSecret: process.env.PLAID_SECRET,
};

// Validate environment variables
if (!config.plaidEnv || !config.plaidClientId || !config.plaidSecret) {
    throw new Error('Missing necessary environment variables for Plaid configuration');
}

const plaidClient = new plaid.PlaidApi(new plaid.Configuration({
    basePath: plaid.PlaidEnvironments[config.plaidEnv],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': config.plaidClientId,
            'PLAID-SECRET': config.plaidSecret,
        },
    },
}));

const createLinkToken = asyncHandler(async (req, res) => {
    const { userID } = req.body;
    if (!userID) {
        return res.status(400).json({ error: 'userID is required' });
    }

    const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userID.toString() },
        client_name: 'FinanceFlow App',
        products: ['transactions'],
        country_codes: ['US'],
        language: 'en',
    });
    res.json({ link_token: response.data.link_token });
});

const exchangePublicToken = asyncHandler(async (req, res) => {
    const { public_token, userID } = req.body;
    if (!public_token || !userID) {
        return res.status(400).json({ error: 'public_token and userID are required' });
    }

    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;

    const query = 'INSERT INTO BankAccounts (userID, accessToken, itemID) VALUES (?, ?, ?)';
    db.execute(query, [userID, accessToken, itemID], (err) => {
        if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
        res.status(201).json({ message: 'Bank account linked successfully' });
    });
});

const getLinkedAccounts = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const [results] = await db.execute('SELECT * FROM BankAccounts WHERE userID = ?', [userID]);
    res.json(results);
});

const getTransactions = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const [results] = await db.execute('SELECT accessToken FROM BankAccounts WHERE userID = ?', [userID]);
    if (!results.length) return res.status(400).json({ error: 'No linked bank account found' });

    const accessToken = results[0].accessToken;
    const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
    });
    res.json(response.data.transactions);
});

module.exports = { createLinkToken, exchangePublicToken, getLinkedAccounts, getTransactions };
