const fs = require('fs');

async function checkModels() {
  const settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
  const apiKey = settings.geminiApiKey;
  console.log('Testing with key:', apiKey.slice(0, 10));

  const urls = [
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
  ];

  for (const url of urls) {
    try {
      console.log('Fetching:', url.split('?')[0]);
      const res = await fetch(url);
      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Data:', JSON.stringify(data).slice(0, 300));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

checkModels().catch(console.error);
