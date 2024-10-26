const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIInsight = async (req, res) => {
  const { userID, transactionHistory } = req.body;
  try {
    const prompt = `Based on the following transaction history: ${transactionHistory}, generate personalized financial advice.`;
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      maxTokens: 150,
      temperature: 0.7,
    });

    const aiRecommendation = response.data.choices[0].text.trim();
    res.status(200).json({ insight: aiRecommendation });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    res.status(500).json({ error: 'Error generating AI insight' });
  }
};

module.exports = { generateAIInsight };
