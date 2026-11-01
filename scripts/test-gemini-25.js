const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testGemini25() {
  const settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
  console.log('Testing gemini-2.5-flash...');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent('Berikan 1 trik cepat matematika untuk anak SD dalam 1 kalimat.');
  console.log('RESPON GEMINI 2.5 FLASH:');
  console.log(result.response.text());
}

testGemini25().catch(console.error);
