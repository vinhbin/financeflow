// aiInsightController.js
const OpenAI = require('openai');
const asyncHandler = require('../middleware/asyncHandler');
const config = require('../config/config'); // Ensure 'config/config' is correct


const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const generateAIInsight = asyncHandler(async (req, res) => {
  const { userID, transactionHistory } = req.body;
  if (!userID || !transactionHistory) {
    return res.status(400).json({ error: 'userID and transactionHistory are required' });
  }

  const prompt = `Based on the following transaction history: ${transactionHistory}, generate personalized financial advice.`;
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    maxTokens: 150,
    temperature: 0.7,
  });

  const aiRecommendation = response.data.choices[0].text.trim();
  res.status(200).json({ insight: aiRecommendation });
});

module.exports = { generateAIInsight };
