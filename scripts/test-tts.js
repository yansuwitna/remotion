const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');

async function test() {
  const text = 'Halo adik-adik! Siapa yang bisa jawab soal ini? 16 persen kali 50 sama dengan berapa ya?';
  const b64 = await googleTTS.getAudioBase64(text, { lang: 'id', slow: false });
  const outPath = path.join(__dirname, '..', 'out', 'test_tts.mp3');
  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
  console.log('TTS Berhasil dibuat:', outPath, 'Ukuran:', fs.statSync(outPath).size, 'bytes');
}

test().catch(console.error);
