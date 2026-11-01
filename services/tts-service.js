const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');

/**
 * Service Text-To-Speech (TTS) dan Audio Pengarah Suara Bahasa Indonesia
 * Menghasilkan narasi suara manusia yang ramah anak, membaca teks naskah,
 * memberikan pengarahan langkah demi langkah, serta menambahkan BGM & SFX.
 */
class TtsService {
  constructor() {
    this.audioBaseDir = path.join(__dirname, '..', 'public', 'audio');
    if (!fs.existsSync(this.audioBaseDir)) {
      fs.mkdirSync(this.audioBaseDir, { recursive: true });
    }
  }

  /**
   * Bersihkan dan sesuaikan teks untuk pelafalan Bahasa Indonesia yang alami
   */
  cleanTextForTTS(text) {
    if (!text) return '';

    let clean = text
      // Hapus emoji agar TTS tidak mengeja kode emoji
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/gu, '')
      // Normalisasi simbol matematika ke kata-kata bahasa Indonesia
      .replace(/%/g, ' persen ')
      .replace(/[×*]/g, ' kali ')
      .replace(/÷/g, ' bagi ')
      .replace(/\+/g, ' tambah ')
      .replace(/=/g, ' sama dengan ')
      .replace(/√/g, ' akar ')
      .replace(/½/g, ' setengah ')
      .replace(/¼/g, ' seperempat ')
      .replace(/¾/g, ' tiga perempat ')
      .replace(/°/g, ' derajat ')
      .replace(/²/g, ' kuadrat ')
      .replace(/³/g, ' pangkat tiga ')
      .replace(/➔|->|=>/g, ' hasilnya ')
      .replace(/\?/g, ' ya?')
      // Hapus tag bracket seperti [SD], [SMP], dsb
      .replace(/\[.*?\]/g, '')
      // Rapikan spasi berlebih
      .replace(/\s+/g, ' ')
      .trim();

    return clean;
  }

  /**
   * Hasilkan file MP3 dari teks berbahasa Indonesia
   */
  async generateSpeechFile(text, outputPath) {
    const cleaned = this.cleanTextForTTS(text);
    if (!cleaned) return null;

    try {
      const results = await googleTTS.getAllAudioBase64(cleaned, {
        lang: 'id',
        slow: false,
        timeout: 10000
      });

      const buffers = results.map(item => Buffer.from(item.base64, 'base64'));
      const combined = Buffer.concat(buffers);
      fs.writeFileSync(outputPath, combined);
      return outputPath;
    } catch (err) {
      console.warn(`[TTS Notice] Gagal generate TTS online untuk "${cleaned.slice(0, 30)}...":`, err.message);
      // Fallback: buat file wav hening jika offline
      this.createSilentWav(outputPath, 3);
      return outputPath;
    }
  }

  /**
   * File cadangan hening jika offline
   */
  createSilentWav(outputPath, durationSeconds = 3) {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const dataSize = numSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Hasilkan paket suara lengkap (Narasi Hook, 5 Scene, Penutup CTA, BGM, dan SFX)
   * @param {string} videoId 
   * @param {Object} remotionProps 
   * @returns {Promise<Object>} audio configuration untuk Remotion
   */
  async generateVoicePackage(videoId, remotionProps) {
    const videoAudioDir = path.join(this.audioBaseDir, videoId);
    if (!fs.existsSync(videoAudioDir)) {
      fs.mkdirSync(videoAudioDir, { recursive: true });
    }

    console.log(`[TTS] Memulai pembuatan suara narasi pengarah untuk video: ${videoId}...`);

    // 1. Narasi Hook Pembuka
    const hookSpeechText = remotionProps.hookVoice || 
      `${remotionProps.hook || 'Teka-teki matematika seru!'} Siapa yang bisa jawab soal ini?`;
    const hookFile = path.join(videoAudioDir, 'hook.mp3');
    await this.generateSpeechFile(hookSpeechText, hookFile);

    // 2. Narasi Per Scene
    const sceneAudios = [];
    const scenes = remotionProps.scenes || [];

    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      let sceneSpeechText = '';

      if (sc.layout === 'kids-challenge' || i === 0) {
        sceneSpeechText = `${sc.title}. ${sc.stat || ''}. ${sc.body || ''}`;
      } else if (sc.layout === 'battle-vs' || i === 1) {
        const oldM = sc.oldMethod ? `Cara biasa: ${sc.oldMethod}.` : '';
        const fastM = sc.fastMethod ? `Trik kilatnya: ${sc.fastMethod}.` : '';
        sceneSpeechText = `${sc.title}. ${oldM} ${fastM} ${sc.body || ''}`;
      } else if (sc.layout === 'step-flow' || sc.layout === 'geometry' || i === 2) {
        sceneSpeechText = `${sc.title}. ${sc.highlight ? sc.highlight + '.' : ''} ${sc.stat ? sc.stat + '.' : ''} ${sc.body || ''}`;
      } else if (sc.layout === 'practice-round' || i === 3) {
        sceneSpeechText = `Sekarang giliranmu mencoba! ${sc.stat || ''}. Coba kamu hitung cepat dalam 5 detik ya!`;
      } else if (sc.layout === 'celebration-star' || i === 4) {
        sceneSpeechText = `Hebat! Kamu juara kelas! ${sc.highlight || ''}. ${sc.body || ''}`;
      } else {
        sceneSpeechText = `${sc.title}. ${sc.body || ''}`;
      }

      const sceneFile = path.join(videoAudioDir, `scene_${i}.mp3`);
      await this.generateSpeechFile(sceneSpeechText, sceneFile);
      sceneAudios.push(`audio/${videoId}/scene_${i}.mp3`);
    }

    // 3. Narasi Penutup CTA
    const ctaSpeechText = remotionProps.ctaVoice || 
      `${remotionProps.ctaText || 'Komen jawabanmu di bawah dan follow untuk trik juara kelas berikutnya!'}`;
    const ctaFile = path.join(videoAudioDir, 'cta.mp3');
    await this.generateSpeechFile(ctaSpeechText, ctaFile);

    console.log(`[TTS] Berhasil menghasilkan seluruh file suara narasi untuk ID: ${videoId}!`);

    return {
      hook: `audio/${videoId}/hook.mp3`,
      scenes: sceneAudios,
      cta: `audio/${videoId}/cta.mp3`,
      bgm: 'audio/sfx/bgm_kids.wav',
      sfx: {
        pop: 'audio/sfx/pop.wav',
        tick: 'audio/sfx/tick.wav',
        levelup: 'audio/sfx/levelup.wav'
      }
    };
  }
}

module.exports = new TtsService();
