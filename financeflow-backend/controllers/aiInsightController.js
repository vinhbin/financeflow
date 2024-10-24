const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateAIInsight = async (req, res) => {
    const { userID, transactionHistory } = req.body; // Expecting transaction history to be passed

    try {
        const prompt = `Based on the following transaction history: ${transactionHistory}, generate personalized financial advice.`;

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 150,
            n: 1,
            stop: null,
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
