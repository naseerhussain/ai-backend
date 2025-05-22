require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 3200;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Put your real key in the .env file
  basePath: "https://openrouter.ai/api/v1",
  max_tokens: 500, // ✅ Lower than 666
  temperature: 0.7,
});
const openai = new OpenAIApi(configuration);

app.post("/ask", async (req, res) => {
res.setHeader("Content-Type", "application/json");
  try {
    const { message } = req.body;

    const completion = await openai.createChatCompletion({
        model: "openai/gpt-3.5-turbo", // or "openai/gpt-3.5-turbo", "anthropic/claude-3-sonnet", etc.
        messages: [{ role: "user", content: message }]
    });

    return res.status(200).json({
      success: true,
      message: completion.data.choices[0].message.content.trim(),
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});