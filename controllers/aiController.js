const { GoogleGenerativeAI } = require("@google/generative-ai");

// Assuming this is already initialized once in your main setup file:
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in .env file");
  process.exit(1);
}

let genAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("Gemini initialized");
} catch (error) {
  console.error("Error initializing Gemini AI:", error);
  process.exit(1);
}

// Main controller
exports.getExplanation = async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Explain the following technical concept in simple terms: "${text}".` +
      (context ? `\nThe context is: "${context}".` : "") +
      `\nProvide a clear and more more concise explanation suitable for a technical blog reader.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const explanation = result.response.text();

    res.status(200).json({ explanation });

  } catch (error) {
    console.error("Error generating explanation:", error);
    res.status(500).json({
      error: "Failed to generate explanation",
      details: error.message,
    });
  }
};
