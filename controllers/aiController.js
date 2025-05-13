const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get AI explanation for selected text
exports.getExplanation = async (req, res) => {
  try {
    const { text, context } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a prompt
    const prompt = `Explain the following technical concept in simple terms: "${text}". 
    ${context ? `The context is: "${context}"` : ''}
    Provide a clear and concise explanation suitable for a technical blog reader.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();
    
    res.json({ explanation });
  } catch (err) {
    console.error('Error with Gemini API:', err);
    res.status(500).json({ error: 'Failed to get explanation from AI' });
  }
};