const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testFastModel() {
  const settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);

  const candidates = [
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash-lite-tts'
  ];

  for (const mName of candidates) {
    console.log(`Testing model: ${mName}...`);
    const startTime = Date.now();
    try {
      const model = genAI.getGenerativeModel({ model: mName });
      // Add timeout promise
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout 8s')), 8000));
      const res = await Promise.race([
        model.generateContent('Sebutkan 1 angka acak.'),
        timeoutPromise
      ]);
      console.log(`✅ Model ${mName} SUCCESS in ${Date.now() - startTime}ms:`, res.response.text().trim());
      return mName;
    } catch (e) {
      console.log(`❌ Model ${mName} failed:`, e.message);
    }
  }
}

testFastModel().catch(console.error);
