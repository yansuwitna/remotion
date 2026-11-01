const ttsService = require('../services/tts-service');
const fs = require('fs');
const path = require('path');

async function main() {
  const sampleProps = {
    level: "🎒 LEVEL SD & SMP",
    hook: "TEKA-TEKI MATEMATIKA SERU!",
    scenes: [
      {
        layout: "kids-challenge",
        title: "Siapa Bisa Jawab Soal Ini?",
        stat: "16% × 50 = ?",
        body: "Di kelas, banyak teman-teman yang cakar kertas berlama-lama hanya untuk menghitung 16 persen dari 50!"
      },
      {
        layout: "battle-vs",
        title: "Kenapa Cara Lama Bikin Pusing?",
        oldMethod: "16 per 100 kali 50 sama dengan 800 per 100",
        fastMethod: "Balik angkanya jadi 50 persen dari 16",
        body: "Jangan pakai cara lama yang berbelit-belit! Ada trik sulap rahasia!"
      },
      {
        layout: "step-flow",
        title: "Bongkar Rahasia: Sifat Komutatif",
        highlight: "Tinggal Dibalik Saja",
        stat: "x% dari y = y% dari x",
        body: "16% dari 50 itu nilainya sama persis dengan 50% dari 16! Setengah dari 16 adalah 8!"
      },
      {
        layout: "practice-round",
        title: "Sekarang Giliranmu Mencoba!",
        stat: "Berapa 18% dari 50?",
        body: "Balik angkanya dan hitung dalam 5 detik!"
      },
      {
        layout: "celebration-star",
        title: "Hebat! Kamu Juara Kelas!",
        highlight: "Jawaban Tepat Adalah 9",
        body: "50% dari 18 adalah 9! Gampang banget kan? Sekarang kamu sudah juara berhitung cepat!"
      }
    ],
    ctaText: "Komen jawabanmu & Follow untuk trik juara kelas berikutnya!"
  };

  const audioConfig = await ttsService.generateVoicePackage('test_voice_pack', sampleProps);
  console.log('Audio Config Result:', JSON.stringify(audioConfig, null, 2));

  // Verify file existence and sizes
  const testDir = path.join(__dirname, '..', 'public', 'audio', 'test_voice_pack');
  const files = fs.readdirSync(testDir);
  console.log('Generated Files in test_voice_pack:');
  for (const f of files) {
    const fPath = path.join(testDir, f);
    console.log(` - ${f}: ${fs.statSync(fPath).size} bytes`);
  }
}

main().catch(console.error);
