const plaid = require('plaid');
require('dotenv').config();
const db = require('../config/dbConfig');

const plaidClient = new plaid.PlaidApi(new plaid.Configuration({
    basePath: plaid.PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
}));

const createLinkToken = async (req, res) => {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: req.body.userID.toString() },
            client_name: 'FinanceFlow App',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en',
        });
        res.json({ link_token: response.data.link_token });
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({ error: 'Error creating link token' });
    }
};

const exchangePublicToken = async (req, res) => {
    try {
        const { public_token, userID } = req.body;
        const response = await plaidClient.itemPublicTokenExchange({ public_token });
        const accessToken = response.data.access_token;
        const itemID = response.data.item_id;

        const query = 'INSERT INTO BankAccounts (userID, accessToken, itemID) VALUES (?, ?, ?)';
        db.execute(query, [userID, accessToken, itemID], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Bank account linked successfully' });
        });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({ error: 'Error exchanging public token' });
    }
};

const getLinkedAccounts = async (req, res) => {
    const { userID } = req.params;
    try {
        const [results] = await db.execute('SELECT * FROM BankAccounts WHERE userID = ?', [userID]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching linked accounts:', error);
        res.status(500).json({ error: 'Error fetching linked accounts' });
    }
};

const getTransactions = async (req, res) => {
    const { userID } = req.params;
    try {
        const [results] = await db.execute('SELECT accessToken FROM BankAccounts WHERE userID = ?', [userID]);
        if (!results.length) return res.status(400).json({ error: 'No linked bank account found' });

        const accessToken = results[0].accessToken;
        const response = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
        });
        res.json(response.data.transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
};

module.exports = { createLinkToken, exchangePublicToken, getLinkedAccounts, getTransactions };
