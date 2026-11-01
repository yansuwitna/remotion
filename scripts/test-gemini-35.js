const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testFullScript() {
  const settings = JSON.parse(fs.readFileSync('data/settings.json', 'utf8'));
  const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
  console.log('Testing gemini-3.5-flash-lite generating 1-minute math video JSON...');

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = `
Kamu adalah Guru & Kreator Konten Matematika Viral No. 1 di YouTube Shorts dan TikTok (@MatematikaSeruAI).
Buatkan naskah video matematika 1 Menit (60 detik) untuk topik: "Trik Persen Cepat".
Target: Anak SD & SMP.

Format JSON Wajib:
{
  "youtubeTitle": "string",
  "tiktokTitle": "string",
  "description": "string",
  "tags": ["string"],
  "remotionProps": {
    "level": "🎒 LEVEL SD & SMP",
    "hook": "string (2-4 kata)",
    "mascot": "🦉",
    "brandName": "@MatematikaSeruAI",
    "ctaText": "string",
    "theme": "kids-arcade",
    "scenes": [
      {
        "layout": "kids-challenge",
        "title": "string",
        "highlight": "string",
        "stat": "string",
        "tag": "🎮 TANTANGAN SERU",
        "body": "string",
        "icon": "❓"
      },
      {
        "layout": "battle-vs",
        "title": "string",
        "highlight": "string",
        "stat": "string",
        "tag": "⚔️ VS BATTLE",
        "oldMethod": "string",
        "fastMethod": "string",
        "body": "string",
        "icon": "⚡"
      },
      {
        "layout": "step-flow",
        "title": "string",
        "highlight": "string",
        "stat": "string",
        "tag": "✨ TRIK RAHASIA",
        "body": "string",
        "icon": "💡"
      },
      {
        "layout": "practice-round",
        "title": "string",
        "highlight": "string",
        "stat": "string",
        "tag": "🎯 GILIRAN KAMU",
        "body": "string",
        "icon": "⏳"
      },
      {
        "layout": "celebration-star",
        "title": "string",
        "highlight": "string",
        "stat": "string",
        "tag": "🏆 LEVEL UP!",
        "body": "string",
        "icon": "🎉"
      }
    ]
  }
}
`;

  const startTime = Date.now();
  const res = await model.generateContent(prompt);
  console.log(`Gemini 3.5 Flash Lite responded in ${Date.now() - startTime}ms!`);
  const jsonText = res.response.text();
  const parsed = JSON.parse(jsonText);
  console.log('Parsed Title:', parsed.youtubeTitle);
  console.log('Scenes count:', parsed.remotionProps.scenes.length);
  console.log('Scene 1 title:', parsed.remotionProps.scenes[0].title);
}

testFullScript().catch(console.error);
