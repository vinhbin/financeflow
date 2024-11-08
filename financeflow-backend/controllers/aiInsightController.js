// controllers/aiInsightController.js
const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');
const config = require('../config/config');
const db = require('../config/dbConfig');

const generateAIInsight = asyncHandler(async (req, res) => {
  const { userID } = req.user;

  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    // Fetch the latest 10 expenses
    const [expenses] = await db.execute(
      'SELECT description, amount, date FROM Expenses WHERE userID = ? ORDER BY date DESC LIMIT 10',
      [userID]
    );

    // Fetch the latest 10 transactions
    const [transactions] = await db.execute(
      `SELECT t.description, t.amount, t.date FROM Transactions t
       INNER JOIN BankAccounts b ON t.accountID = b.id
       WHERE b.userID = ? ORDER BY t.date DESC LIMIT 10`,
      [userID]
    );

    // Combine expenses and transactions
    const allTransactions = [...expenses, ...transactions];

    if (!allTransactions.length) {
      return res.status(200).json({ message: 'No transaction history available to generate insights.' });
    }

    // Sort all transactions by date descending
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to latest 10 transactions
    const latestTransactions = allTransactions.slice(0, 10);

    // Format transaction history
    const transactionHistory = latestTransactions
      .map((tx) => `${tx.description}: $${parseFloat(tx.amount).toFixed(2)}`)
      .join(', ');

    // Get financial metrics from the database
    const [metrics] = await db.execute(
      `SELECT
         COALESCE(SUM(amount), 0) as totalExpenses
       FROM Expenses
       WHERE userID = ?`,
      [userID]
    );

    const totalExpenses = parseFloat(metrics[0].totalExpenses) || 0;

    // Calculate total income from transactions (assuming negative amounts are income)
    const [incomeMetrics] = await db.execute(
      `SELECT
         COALESCE(SUM(t.amount), 0) as totalIncome
       FROM Transactions t
       INNER JOIN BankAccounts b ON t.accountID = b.id
       WHERE b.userID = ? AND t.amount < 0`,
      [userID]
    );

    const totalIncome = -parseFloat(incomeMetrics[0].totalIncome) || 0; // Convert negative income to positive
    const combinedTotal = totalIncome - totalExpenses;

    // Calculate the time span of the data
    const earliestDate = allTransactions[allTransactions.length - 1].date;
    const latestDate = allTransactions[0].date;
    const dateSpan = Math.ceil((new Date(latestDate) - new Date(earliestDate)) / (1000 * 60 * 60 * 24)) || 1; // In days

    // Build the prompt for OpenAI
    const prompt = `Based on the following transaction history over the past ${dateSpan} days: ${transactionHistory}, and the total expenses: $${totalExpenses.toFixed(
      2
    )}, total income: $${totalIncome.toFixed(2)}, and net total: $${combinedTotal.toFixed(
      2
    )}, provide personalized financial advice. Include compliments on what the user is doing well and suggestions for improvement. Keep the response concise and under 200 words.`;

    // Make HTTP POST request to OpenAI API using the cost-effective gpt-3.5-turbo model
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Low-cost model
        messages: [
          {
            role: 'system',
            content:
              "You are a helpful financial assistant providing personalized financial advice based on the user's transaction history and financial metrics.",
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 250,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
      }
    );

    const aiRecommendation = response.data.choices[0].message.content.trim();

    // Save the insight to the AiInsights table
    await db.execute('INSERT INTO AiInsights (userID, recommendation) VALUES (?, ?)', [userID, aiRecommendation]);

    res.status(200).json({ insight: aiRecommendation });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
    res.status(500).json({ error: 'Failed to generate AI insight. Please try again later.' });
  }
});

module.exports = { generateAIInsight };
