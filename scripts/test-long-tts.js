const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');

async function testLongText() {
  const longText = 'Siapa bisa jawab soal ini? 16 persen kali 50 sama dengan berapa ya? Di kelas, banyak teman-teman yang cakar kertas berlama-lama hanya untuk menghitung 16 persen dari 50! Padahal ada trik sulap yang sangat cepat!';
  const results = await googleTTS.getAllAudioBase64(longText, {
    lang: 'id',
    slow: false,
    timeout: 10000
  });

  const buffers = results.map(item => Buffer.from(item.base64, 'base64'));
  const combined = Buffer.concat(buffers);
  const outPath = path.join(__dirname, '..', 'out', 'test_long_tts.mp3');
  fs.writeFileSync(outPath, combined);
  console.log('Long TTS Success! Chunks:', results.length, 'Size:', combined.length, 'bytes');
}

testLongText().catch(console.error);
