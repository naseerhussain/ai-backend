const fs = require("fs");
const path = require("path");
const customPatternsFile = path.join(__dirname, "user_patterns.json");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Put your real key in the .env file
  basePath: "https://openrouter.ai/api/v1",
  max_tokens: 500, // ✅ Lower than 666
  temperature: 0.7,
});

const openai = new OpenAIApi(configuration);

let userPatterns = {};
if (fs.existsSync(customPatternsFile)) {
  userPatterns = JSON.parse(fs.readFileSync(customPatternsFile));
}

const negative_responses = [
    "Sorry! I don't understand.",
    "Please tell me more or ask something else."
];

const productMatch = {
  about_nso: /\bnso\b/,
  about_bpa: /\bbpa\b/,
  about_matrix: /\bmatrix\b/,
  continue_chat: /\b(more|continue)\b/
};

const describeNSO = () => {
  const responses = [
    "Cisco NSO is a network service orchestrator.",
    "NSO helps to design and deliver high-quality services faster."
  ];
  return randomChoice(responses);
};

const describeBPA = () => {
  const responses = [
    "Cisco Business Process Automation (BPA) Services.",
    "BPA acts as a front-end automation tool."
  ];
  return randomChoice(responses);
};

const describeMatrix = () => {
  const responses = [
    "Cisco Matrix helps in network analysis.",
    "Presents a dashboard and supports network monitoring."
  ];
  return randomChoice(responses);
};

const continueChat = () => {
  const responses = [
    "What do you want to know more?",
    "How can I help you further?"
  ];
  return randomChoice(responses);
};

const noMatchIntent = () => {
  return randomChoice(negative_responses);
};

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Save patterns persistently
const saveUserPatterns = () => {
  fs.writeFileSync(customPatternsFile, JSON.stringify(userPatterns, null, 2));
};

const matchReply = (message) => {
  const lowerMsg = message.toLowerCase();

  for (const pattern in userPatterns) {
    const regex = new RegExp(pattern);
    if (regex.test(lowerMsg)) {
      return userPatterns[pattern];
    }
  }

  // fallback to built-in intents
  for (const [intent, pattern] of Object.entries(productMatch)) {
    if (pattern.test(message)) {
      switch (intent) {
        case "about_nso": return describeNSO();
        case "about_bpa": return describeBPA();
        case "about_matrix": return describeMatrix();
        case "continue_chat": return continueChat();
      }
    }
  }

  return noMatchIntent();
};

async function fallbackLLMResponse(message) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
    max_tokens: 100,
    temperature: 0.7
  });

  return completion.data.choices[0].message.content;
}

module.exports = {
    saveUserPatterns,
    matchReply,
    fallbackLLMResponse,
    negative_responses,
    userPatterns
}