const fs = require('fs');

async function listModels() {
  const settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
  const apiKey = settings.geminiApiKey;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const models = (data.models || []).map(m => ({
    name: m.name,
    supportedGenerationMethods: m.supportedGenerationMethods
  }));
  console.log('Available Models:', JSON.stringify(models, null, 2));
}

listModels().catch(console.error);
