// controllers/aiInsightController.js
const OpenAI = require('openai');
const asyncHandler = require('../middleware/asyncHandler');
const config = require('../config/config');
const db = require('../config/dbConfig');

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const generateAIInsight = asyncHandler(async (req, res) => {
  const { userID } = req.body;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    // Fetch the latest 10 transactions from Expenses table
    const [transactions] = await db.execute(
      'SELECT description, amount FROM Expenses WHERE userID = ? ORDER BY date DESC LIMIT 10',
      [userID]
    );

    if (!transactions.length) {
      return res.status(200).json({ message: 'No transaction history available to generate insights.' });
    }

    // Format transaction history
    const transactionHistory = transactions
      .map((tx) => `${tx.description}: $${tx.amount}`)
      .join(', ');

    const prompt = `Based on the following transaction history: ${transactionHistory}, generate personalized financial advice.`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiRecommendation = response.data.choices[0].text.trim();

    // Optionally, save the insight to the AiInsights table
    await db.execute('INSERT INTO AiInsights (userID, recommendation) VALUES (?, ?)', [
      userID,
      aiRecommendation,
    ]);

    res.status(200).json({ insight: aiRecommendation });
  } catch (error) {
    console.error('Error generating AI insight:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate AI insight. Please try again later.' });
  }
});

module.exports = { generateAIInsight };
