require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helper = require('./helper');

const app = express();
const port = 3200;

app.use(cors());
app.use(express.json());


app.post("/ask", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
        const { message } = req.body;

        const response = helper.matchReply(message);
        if (!response || helper.negative_responses.includes(response)) {
            const aiResponse = await helper.fallbackLLMResponse(message);
            return res.json({ success: true, message: aiResponse });
        }
        return res.json({ success: true, message: response });
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

app.post("/teach", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
        const { pattern, response } = req.body;
        if (!pattern || !response) {
            return res.status(400).json({ success: false, message: "Pattern and response required." });
        }

        helper.userPatterns[pattern.toLowerCase()] = response;
        helper.saveUserPatterns();
        await helper.refreshPatterns();
        return res.json({ success: true, message: "Bot learned new pattern." });
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${ port }`);
});