import React from 'react';
import { Composition } from 'remotion';
import { ShortVideo } from './compositions/ShortVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ShortVideo"
        component={ShortVideo}
        durationInFrames={1800} // 60 detik (1 Menit) pada 30 fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          level: "🎒 LEVEL SD & SMP",
          hook: "TEKA-TEKI MATEMATIKA SERU!",
          mascot: "🦉",
          scenes: [
            {
              layout: "kids-challenge",
              title: "Siapa Bisa Jawab Soal Ini?",
              highlight: "Tantangan Berhitung",
              stat: "16% × 50 = ?",
              tag: "🎮 TANTANGAN SERU",
              body: "Di kelas, banyak teman-teman yang cakar kertas berlama-lama hanya untuk menghitung 16 persen dari 50!",
              icon: "❓"
            },
            {
              layout: "battle-vs",
              title: "Kenapa Cara Lama Bikin Pusing?",
              highlight: "Perang Metode",
              stat: "Cara Lama vs Trik Sulap",
              tag: "⚔️ VS BATTLE",
              oldMethod: "16/100 × 50 = 800/100 = 8 (Bikin Puyeng 😫)",
              fastMethod: "Balik angkanya: 50% dari 16! (Cuma 2 Detik 🤩)",
              body: "Jangan pakai cara lama yang berbelit-belit! Ada trik sulap rahasia yang bikin kamu jadi juara kelas!",
              icon: "⚡"
            },
            {
              layout: "step-flow",
              title: "Bongkar Rahasia: Sifat Komutatif",
              highlight: "Tinggal Dibalik Saja!",
              stat: "x% dari y = y% dari x",
              tag: "✨ TRIK RAHASIA",
              body: "Trik ajaibnya: 16% dari 50 itu nilainya sama persis dengan 50% dari 16! 50% kan tinggal dibagi dua, hasilnya 8!",
              icon: "💡"
            },
            {
              layout: "practice-round",
              title: "Sekarang Giliranmu Mencoba!",
              highlight: "Tantangan Latihan Interaktif",
              stat: "Berapa 18% dari 50?",
              tag: "🎯 GILIRAN KAMU",
              body: "Coba gunakan trik yang baru kamu pelajari tadi! Balik angkanya dan hitung dalam 5 detik!",
              icon: "⏳"
            },
            {
              layout: "celebration-star",
              title: "Hebat! Kamu Juara Kelas!",
              highlight: "Jawaban Tepat: 9!",
              stat: "50% × 18 = 9 (Benar 100%)",
              tag: "🏆 LEVEL UP!",
              body: "50% dari 18 adalah 9! Gampang banget kan? Sekarang kamu sudah 10x lebih pintar berhitung cepat!",
              icon: "🎉"
            }
          ],
          brandName: "@MatematikaSeruAI",
          ctaText: "Komen jawabanmu & Follow untuk trik juara kelas berikutnya! 🚀⭐",
          theme: "kids-arcade",
          audio: {
            hook: "audio/test_voice_pack/hook.mp3",
            scenes: [
              "audio/test_voice_pack/scene_0.mp3",
              "audio/test_voice_pack/scene_1.mp3",
              "audio/test_voice_pack/scene_2.mp3",
              "audio/test_voice_pack/scene_3.mp3",
              "audio/test_voice_pack/scene_4.mp3"
            ],
            cta: "audio/test_voice_pack/cta.mp3",
            bgm: "audio/sfx/bgm_kids.wav",
            sfx: {
              pop: "audio/sfx/pop.wav",
              tick: "audio/sfx/tick.wav",
              levelup: "audio/sfx/levelup.wav"
            }
          }
        }}
      />
    </>
  );
};
