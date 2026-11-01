const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testApiKey() {
  const settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
  const apiKey = settings.geminiApiKey;
  console.log('API Key starts with:', apiKey.slice(0, 8), 'Length:', apiKey.length);

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro'];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent('Hai');
      console.log(`Model ${modelName} SUCCESS:`, res.response.text());
      return;
    } catch (e) {
      console.log(`Model ${modelName} failed:`, e.message);
    }
  }
}

testApiKey().catch(console.error);
