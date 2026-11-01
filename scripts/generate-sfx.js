const fs = require('fs');
const path = require('path');

// Helper untuk membuat WAV file sederhana 16-bit PCM
function createWavBuffer(sampleRate, durationSeconds, generateSample) {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample (mono)
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat = 1 (PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels = 1 (Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign = 2
  buffer.writeUInt16LE(16, 34); // BitsPerSample = 16

  // 'data' subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Tulis sample audio
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = generateSample(t, i, numSamples);
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

// 1. Pop Sound (Cute bubble pop)
function createPopSfx() {
  return createWavBuffer(44100, 0.15, (t) => {
    const freq = 400 + 600 * (1 - t / 0.15);
    const env = Math.exp(-t * 25);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.7;
  });
}

// 2. Ticking Sound (Countdown clock tick)
function createTickSfx() {
  return createWavBuffer(44100, 0.08, (t) => {
    const freq = 1200;
    const env = Math.exp(-t * 50);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.5;
  });
}

// 3. Level Up / Fanfare Sound (C-E-G-C Arpeggio Chime)
function createLevelUpSfx() {
  return createWavBuffer(44100, 1.2, (t) => {
    // 4 nada arpeggio: C5(523Hz), E5(659Hz), G5(784Hz), C6(1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const noteIdx = Math.min(3, Math.floor(t / 0.18));
    const noteTime = t - noteIdx * 0.18;
    const freq = notes[noteIdx];
    const env = Math.exp(-noteTime * 4);
    return (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(4 * Math.PI * freq * t)) * env * 0.6;
  });
}

// 4. Background Music (Lofi Kid-Friendly Marimba Melody 60 detik)
function createBgmAudio(duration = 60) {
  // Akor riang C - G - Am - F
  const chords = [
    [261.63, 329.63, 392.00], // C
    [196.00, 246.94, 293.66], // G
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63]  // F
  ];
  return createWavBuffer(22050, duration, (t) => {
    const beatTime = t * 1.8; // ~108 BPM
    const chordIdx = Math.floor((beatTime / 4) % 4);
    const chord = chords[chordIdx];
    const stepInMeasure = Math.floor(beatTime % 4);
    const stepTime = (beatTime % 1);

    // Bass note
    const bassFreq = chord[0] / 2;
    const bassEnv = Math.exp(-stepTime * 3);
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv * 0.25;

    // Melody marimba arpeggio
    const noteFreq = chord[stepInMeasure % 3] * 1.5;
    const melEnv = Math.exp(-stepTime * 5);
    const melody = Math.sin(2 * Math.PI * noteFreq * t) * melEnv * 0.2;

    // Gentle rhythm pulse
    const kick = stepInMeasure === 0 ? Math.sin(2 * Math.PI * 65 * stepTime) * Math.exp(-stepTime * 12) * 0.2 : 0;

    return (bass + melody + kick) * 0.5;
  });
}

const sfxDir = path.join(__dirname, '..', 'public', 'audio', 'sfx');
fs.mkdirSync(sfxDir, { recursive: true });

fs.writeFileSync(path.join(sfxDir, 'pop.wav'), createPopSfx());
fs.writeFileSync(path.join(sfxDir, 'tick.wav'), createTickSfx());
fs.writeFileSync(path.join(sfxDir, 'levelup.wav'), createLevelUpSfx());
fs.writeFileSync(path.join(sfxDir, 'bgm_kids.wav'), createBgmAudio(60));

console.log('SFX and BGM files generated successfully in public/audio/sfx!');
