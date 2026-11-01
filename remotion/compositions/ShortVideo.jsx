import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile
} from 'remotion';

// Safe Audio Component untuk memutar narasi suara TTS, BGM, dan SFX
const SafeAudio = ({ src, volume = 1, loop = false }) => {
  if (!src) return null;
  let finalSrc = src;
  if (!src.startsWith('http') && !src.startsWith('data:')) {
    try {
      finalSrc = staticFile(src);
    } catch {
      finalSrc = `/${src}`;
    }
  }
  return <Audio src={finalSrc} volume={volume} loop={loop} />;
};

// ==========================================
// PALET WARNA CERIA & RAMAH ANAK SEKOLAHAN
// ==========================================
const THEMES = {
  'kids-arcade': {
    name: 'Kids Arcade Ceria',
    bgBase: '#070d1e',
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#facc15',
    accentGrad: 'linear-gradient(135deg, #facc15 0%, #fb923c 100%)',
    cardBg: 'rgba(12, 22, 45, 0.94)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    blob1: '#38bdf8',
    blob2: '#ec4899',
    blob3: '#facc15',
    textHighlight: '#facc15',
    badgeBg: 'rgba(250, 204, 21, 0.18)',
    progressGrad: 'linear-gradient(90deg, #38bdf8, #818cf8, #ec4899, #facc15)'
  },
  'school-chalkboard': {
    name: 'Papan Tulis Sekolah',
    bgBase: '#051810',
    primary: '#34d399',
    secondary: '#10b981',
    accent: '#fef08a',
    accentGrad: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    cardBg: 'rgba(8, 30, 20, 0.94)',
    borderColor: 'rgba(52, 211, 153, 0.55)',
    glowColor: 'rgba(52, 211, 153, 0.55)',
    blob1: '#10b981',
    blob2: '#059669',
    blob3: '#34d399',
    textHighlight: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.18)',
    progressGrad: 'linear-gradient(90deg, #059669, #34d399, #fef08a)'
  },
  'candy-pop': {
    name: 'Candy Pop Seru',
    bgBase: '#13061f',
    primary: '#f472b6',
    secondary: '#c084fc',
    accent: '#facc15',
    accentGrad: 'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)',
    cardBg: 'rgba(26, 12, 44, 0.94)',
    borderColor: 'rgba(244, 114, 182, 0.55)',
    glowColor: 'rgba(244, 114, 182, 0.55)',
    blob1: '#c084fc',
    blob2: '#f472b6',
    blob3: '#38bdf8',
    textHighlight: '#f472b6',
    badgeBg: 'rgba(244, 114, 182, 0.18)',
    progressGrad: 'linear-gradient(90deg, #c084fc, #f472b6, #facc15)'
  },
  'neon-cyan': {
    name: 'Cyber Math Neon',
    bgBase: '#040814',
    primary: '#00f2fe',
    secondary: '#4facfe',
    accent: '#facc15',
    accentGrad: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    cardBg: 'rgba(8, 16, 32, 0.92)',
    borderColor: 'rgba(0, 242, 254, 0.45)',
    glowColor: 'rgba(0, 242, 254, 0.55)',
    blob1: '#00f2fe',
    blob2: '#3b82f6',
    blob3: '#6366f1',
    textHighlight: '#00f2fe',
    badgeBg: 'rgba(0, 242, 254, 0.15)',
    progressGrad: 'linear-gradient(90deg, #00f2fe, #4facfe, #818cf8, #facc15)'
  },
  'sunset-fire': {
    name: 'Atomic Formula Fire',
    bgBase: '#120406',
    primary: '#ff416c',
    secondary: '#ff4b2b',
    accent: '#f9d423',
    accentGrad: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
    cardBg: 'rgba(30, 9, 14, 0.92)',
    borderColor: 'rgba(255, 75, 43, 0.45)',
    glowColor: 'rgba(255, 65, 108, 0.55)',
    blob1: '#ff416c',
    blob2: '#ff4b2b',
    blob3: '#f9d423',
    textHighlight: '#ff4b2b',
    badgeBg: 'rgba(255, 65, 108, 0.15)',
    progressGrad: 'linear-gradient(90deg, #ff416c, #ff4b2b, #f9d423)'
  }
};

/**
 * Komposisi Video 1 Menit (60 Detik / 1800 Frames @ 30 FPS)
 * Didesain sangat interaktif, seru, dan ramah untuk anak-anak sekolahan (SD s/d Kuliah):
 * - Durasi 1 Menit (tidak terburu-buru, ada waktu latihan & pemahaman mendalam)
 * - Beragam Bentuk Layout Animasi yang Berganti-Ganti
 * - Maskot Ceria (🦉 Profesor Burung Hantu / 🦊 Rubah Pintar / 🤖 Robot Cerdas)
 * - Latihan Interaktif di Tengah Video ("Sekarang Giliranmu!")
 * - Efek Perayaan Bintang & Konfeti Bintang Emas (⭐⭐⭐ LEVEL UP)
 */
export const ShortVideo = ({
  level = "🎒 LEVEL SD & SMP",
  hook = "TEKA-TEKI MATEMATIKA SERU!",
  mascot = "🦉",
  scenes = [
    {
      layout: "kids-challenge",
      title: "Siapa Bisa Jawab Soal Ini?",
      highlight: "Tantangan 3 Detik",
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
  brandName = "@MatematikaSeruAI",
  ctaText = "Komen jawabanmu & Follow untuk trik juara kelas berikutnya! 🚀⭐",
  theme = "kids-arcade",
  audio = null
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const currentTheme = THEMES[theme] || THEMES['kids-arcade'];

  // Global Progress Bar (0 -> 100%)
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp'
  });

  // Background Ambient Breathing Orbs
  const orb1Y = interpolate(Math.sin(frame / 35), [-1, 1], [-80, 80]);
  const orb1X = interpolate(Math.cos(frame / 40), [-1, 1], [-50, 50]);
  const orb2Y = interpolate(Math.sin((frame + 60) / 30), [-1, 1], [70, -70]);
  const orbOpacity = interpolate(Math.cos(frame / 25), [-1, 1], [0.35, 0.70]);

  // Durasi Scene (Proporsional untuk 1 Menit ~1800 frames)
  const hookDuration = 120; // ~4 detik pembuka yang ramah & seru
  const ctaDuration = 150;  // ~5 detik penutup ajakan follow & subscribe
  const availableFrames = durationInFrames - hookDuration - ctaDuration;
  const sceneDuration = Math.floor(availableFrames / Math.max(1, scenes.length));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: currentTheme.bgBase,
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        color: '#ffffff',
        overflow: 'hidden'
      }}
    >
      {/* 1. Dynamic Animated Ambient Background Orbs */}
      <div
        style={{
          position: 'absolute',
          top: -150 + orb1Y,
          left: -150 + orb1X,
          width: 950,
          height: 950,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentTheme.blob1} 0%, transparent 68%)`,
          filter: 'blur(140px)',
          opacity: orbOpacity,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -200 + orb2Y,
          right: -150,
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentTheme.blob2} 0%, transparent 70%)`,
          filter: 'blur(150px)',
          opacity: orbOpacity * 0.9,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '30%',
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentTheme.blob3} 0%, transparent 75%)`,
          filter: 'blur(120px)',
          opacity: orbOpacity * 0.45,
          pointerEvents: 'none'
        }}
      />

      {/* 2. Floating Fun Symbols & Stars */}
      <FloatingKidsParticles frame={frame} primaryColor={currentTheme.primary} accentColor={currentTheme.accent} />

      {/* 3. Playful Dot/Grid Notebook Paper Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '52px 52px',
          opacity: 0.85,
          pointerEvents: 'none'
        }}
      />

      {/* 4. Soft Cinematic Focus Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 36%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* 5. Top Bar: Channel Header & Level Badge */}
      <TopHeader brandName={brandName} level={level} mascot={mascot} theme={currentTheme} frame={frame} />

      {/* Musik Latar Ceria (BGM) */}
      {audio?.bgm && (
        <SafeAudio src={audio.bgm} volume={0.14} loop />
      )}

      {/* 6. Hook Section (Frames 0 - 120) */}
      <Sequence from={0} durationInFrames={hookDuration}>
        {audio?.hook && <SafeAudio src={audio.hook} volume={1.0} />}
        {audio?.sfx?.pop && <SafeAudio src={audio.sfx.pop} volume={0.4} />}
        <HookKidsSection hookText={hook} mascot={mascot} theme={currentTheme} />
      </Sequence>

      {/* 7. Main Multi-Layout Scenes Sequence (1 Menit Penuh) */}
      {scenes.map((scene, index) => {
        const fromFrame = hookDuration + index * sceneDuration;
        return (
          <Sequence
            key={index}
            from={fromFrame}
            durationInFrames={sceneDuration}
          >
            {/* Suara Narasi Pengarah (TTS Membacakan Teks Materi) */}
            {audio?.scenes?.[index] && (
              <SafeAudio src={audio.scenes[index]} volume={1.0} />
            )}

            {/* Efek Suara Transisi Antar-Scene */}
            {audio?.sfx?.pop && (
              <SafeAudio src={audio.sfx.pop} volume={0.35} />
            )}

            {/* Suara Detik Timer Latihan Interaktif */}
            {scene.layout === 'practice-round' && audio?.sfx?.tick && (
              <SafeAudio src={audio.sfx.tick} volume={0.3} />
            )}

            {/* Suara Fanfare Bintang Perayaan Juara Kelas */}
            {scene.layout === 'celebration-star' && audio?.sfx?.levelup && (
              <SafeAudio src={audio.sfx.levelup} volume={0.65} />
            )}

            <DynamicKidsSceneRenderer
              scene={scene}
              index={index}
              total={scenes.length}
              theme={currentTheme}
              duration={sceneDuration}
              mascot={mascot}
            />
          </Sequence>
        );
      })}

      {/* 8. Call To Action (CTA) Section */}
      <Sequence from={durationInFrames - ctaDuration} durationInFrames={ctaDuration}>
        {audio?.cta && <SafeAudio src={audio.cta} volume={1.0} />}
        <CtaKidsSection ctaText={ctaText} brandName={brandName} theme={currentTheme} />
      </Sequence>

      {/* 9. Bottom Glow Progress Bar */}
      <BottomProgressBar progress={progress} theme={currentTheme} />
    </AbsoluteFill>
  );
};

// ==========================================
// DYNAMIC KIDS SCENE RENDERER (MULTI-BENTUK)
// ==========================================
const DynamicKidsSceneRenderer = (props) => {
  const { scene, index } = props;
  const layout = scene.layout || inferKidsLayout(scene, index);

  switch (layout) {
    case 'kids-challenge':
      return <KidsChallengeLayout {...props} />;
    case 'battle-vs':
      return <BattleVsLayout {...props} />;
    case 'practice-round':
      return <PracticeRoundLayout {...props} />;
    case 'celebration-star':
      return <CelebrationStarLayout {...props} />;
    case 'step-flow':
      return <KidsStepFlowLayout {...props} />;
    case 'geometry':
      return <KidsGeometricLayout {...props} />;
    default:
      return <KidsChallengeLayout {...props} />;
  }
};

function inferKidsLayout(scene, index) {
  const text = `${scene.title} ${scene.tag} ${scene.stat} ${scene.body}`.toLowerCase();
  if (text.includes('giliran') || text.includes('coba') || text.includes('latihan')) {
    return 'practice-round';
  }
  if (text.includes('juara') || text.includes('selamat') || text.includes('hebat') || text.includes('level up')) {
    return 'celebration-star';
  }
  if (text.includes('vs') || text.includes('lama') || text.includes('perang') || text.includes('pusing')) {
    return 'battle-vs';
  }
  if (text.includes('segitiga') || text.includes('pythagoras') || text.includes('sudut')) {
    return 'geometry';
  }
  if (index === 0) return 'kids-challenge';
  if (index === 1) return 'battle-vs';
  if (index === 2) return 'step-flow';
  return 'practice-round';
}

// ==========================================
// BENTUK 1: KIDS CHALLENGE CARD (TANTANGAN AWAL DENGAN MASKOT)
// ==========================================
const KidsChallengeLayout = ({ scene, index, total, theme, duration, mascot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 10, mass: 0.5, stiffness: 110 } });
  const exitProgress = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = 1 - exitProgress;

  // Maskot floating bounce
  const mascotY = Math.sin(frame / 8) * 12;

  // Circular timer
  const timerRatio = interpolate(frame, [0, duration - 25], [1, 0], { extrapolateRight: 'clamp' });
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference * (1 - timerRatio);
  const secondsLeft = Math.max(1, Math.ceil((1 - (frame / (duration - 25))) * 5));

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          transform: `scale(${enterSpring})`,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(30px)',
          border: `3px solid ${theme.borderColor}`,
          borderRadius: 44,
          padding: '44px 44px',
          boxShadow: `0 40px 90px rgba(0, 0, 0, 0.75), 0 0 45px ${theme.glowColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <KidsSceneHeader tag={scene.tag || "🎮 TANTANGAN SERU"} index={index} total={total} theme={theme} />

        {/* Mascot & Timer Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 78, transform: `translateY(${mascotY}px)`, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}>
            {mascot || "🦉"}
          </div>

          <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="38" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
              <circle
                cx="45"
                cy="45"
                r="38"
                stroke={theme.accent}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: 32, fontWeight: 900, color: theme.accent, fontFamily: 'monospace' }}>
              {secondsLeft}s
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 44, fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
          {scene.title}
        </h2>

        {/* Hero Question Box */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: `3px solid ${theme.accent}`,
            borderRadius: 26,
            padding: '18px 48px',
            boxShadow: `0 15px 40px rgba(0,0,0,0.7), 0 0 35px ${theme.accent}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontSize: 18, color: '#94a3b8', fontWeight: 800, letterSpacing: 2 }}>SOAL MENANTANG:</span>
          <div style={{ fontFamily: "'Courier New', 'Fira Code', monospace", fontSize: 50, fontWeight: 900, color: '#ffffff', letterSpacing: 2 }}>
            {scene.stat || "16% × 50 = ?"}
          </div>
        </div>

        <p style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.45, color: '#e2e8f0', margin: 0 }}>
          {scene.body}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// BENTUK 2: BATTLE VS CARD (CARA LAMA PUYENG 😫 vs TRIK SULAP 🤩)
// ==========================================
const BattleVsLayout = ({ scene, index, total, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 11, mass: 0.6 } });
  const exitProgress = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = 1 - exitProgress;

  const oldMethod = scene.oldMethod || "Cara manual yang panjang & bikin puyeng di kelas 😫";
  const fastMethod = scene.fastMethod || "Trik sulap kilat: langsung ketemu dalam 2 detik! 🤩";

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          transform: `scale(${enterSpring})`,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(30px)',
          border: `3px solid ${theme.borderColor}`,
          borderRadius: 44,
          padding: '40px 42px',
          boxShadow: `0 40px 90px rgba(0, 0, 0, 0.75), 0 0 45px ${theme.glowColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <KidsSceneHeader tag={scene.tag || "⚔️ PERANG METODE"} index={index} total={total} theme={theme} />

        <h2 style={{ fontSize: 42, fontWeight: 900, color: '#ffffff', textAlign: 'center', margin: 0 }}>
          {scene.title}
        </h2>

        {/* Panel 1: Cara Lama Bikin Puyeng */}
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.14)',
            border: '2.5px solid rgba(239, 68, 68, 0.55)',
            borderRadius: 24,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{ fontSize: 42, flexShrink: 0 }}>😫</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f87171', letterSpacing: 1.5 }}>CARA LAMA (BIKIN PUYENG):</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', marginTop: 4 }}>
              {oldMethod}
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div style={{ textAlign: 'center', margin: '-8px 0' }}>
          <span style={{ backgroundColor: '#facc15', color: '#000000', fontSize: 20, fontWeight: 900, padding: '4px 18px', borderRadius: 999, letterSpacing: 2 }}>
            VS
          </span>
        </div>

        {/* Panel 2: Trik Sulap Cepat */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.18)',
            border: '3px solid #10b981',
            borderRadius: 24,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
          }}
        >
          <div style={{ fontSize: 42, flexShrink: 0 }}>🤩</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#34d399', letterSpacing: 1.5 }}>TRIK SULAP JUARA (2 DETIK!):</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fef08a', fontFamily: 'monospace', marginTop: 4, textShadow: '0 0 12px rgba(254, 240, 138, 0.6)' }}>
              {fastMethod}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.4, color: '#e2e8f0', textAlign: 'center', margin: 0 }}>
          {scene.body}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// BENTUK 3: STEP-BY-STEP FLOW (ALUR KOMPUTASI 3 KOTAK CERIA)
// ==========================================
const KidsStepFlowLayout = ({ scene, index, total, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 11, mass: 0.6 } });
  const exitProgress = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = 1 - exitProgress;

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          transform: `scale(${enterSpring})`,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(30px)',
          border: `3px solid ${theme.borderColor}`,
          borderRadius: 44,
          padding: '42px 42px',
          boxShadow: `0 40px 90px rgba(0, 0, 0, 0.75), 0 0 45px ${theme.glowColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center'
        }}
      >
        <KidsSceneHeader tag={scene.tag || "✨ TRIK RAHASIA"} index={index} total={total} theme={theme} />

        <h2 style={{ fontSize: 44, fontWeight: 900, color: '#ffffff', margin: 0 }}>
          {scene.title}
        </h2>

        {/* 3 Kotak Alur Komputasi */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%' }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '16px 12px' }}>
            <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 800 }}>LANGKAH 1</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', marginTop: 4 }}>Soal Asli</div>
          </div>

          <div style={{ fontSize: 32, color: theme.accent, fontWeight: 900 }}>➔</div>

          <div style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', border: `2.5px solid ${theme.primary}`, borderRadius: 20, padding: '16px 12px' }}>
            <div style={{ fontSize: 14, color: theme.primary, fontWeight: 800 }}>LANGKAH 2</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: theme.primary, fontFamily: 'monospace', marginTop: 4 }}>Balik Angka!</div>
          </div>

          <div style={{ fontSize: 32, color: theme.accent, fontWeight: 900 }}>➔</div>

          <div style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.22)', border: '2.5px solid #10b981', borderRadius: 20, padding: '16px 12px' }}>
            <div style={{ fontSize: 14, color: '#34d399', fontWeight: 800 }}>HASIL KILAT</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#facc15', fontFamily: 'monospace', marginTop: 4 }}>Ketemu 8!</div>
          </div>
        </div>

        {/* Formula Hero Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fef08a 100%)',
            color: '#0f172a',
            fontSize: 36,
            fontWeight: 900,
            padding: '16px 48px',
            borderRadius: 24,
            boxShadow: '0 12px 35px rgba(245, 158, 11, 0.5)',
            transform: 'rotate(-1deg)',
            fontFamily: 'monospace'
          }}
        >
          ⚡ {scene.stat || "x% dari y = y% dari x"}
        </div>

        <p style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.45, color: '#e2e8f0', margin: 0 }}>
          {scene.body}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// BENTUK 4: PRACTICE ROUND (GILIRAN PENONTON MENCOBA - INTERAKTIF!)
// ==========================================
const PracticeRoundLayout = ({ scene, index, total, theme, duration, mascot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
  const exitProgress = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = 1 - exitProgress;

  // Countdown timer 5 detik untuk latihan
  const timerRatio = interpolate(frame, [0, duration - 20], [1, 0], { extrapolateRight: 'clamp' });
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference * (1 - timerRatio);
  const secondsLeft = Math.max(1, Math.ceil((1 - (frame / (duration - 20))) * 5));

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          transform: `scale(${enterSpring})`,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(30px)',
          border: `3px solid #facc15`,
          borderRadius: 44,
          padding: '42px 42px',
          boxShadow: `0 40px 90px rgba(0, 0, 0, 0.75), 0 0 50px rgba(250, 204, 21, 0.5)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center'
        }}
      >
        <KidsSceneHeader tag={scene.tag || "🎯 WAKTUNYA KAMU MENCOBA!"} index={index} total={total} theme={theme} />

        {/* Mascot & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 72 }}>🦁</div>
          <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r="44" stroke="rgba(255,255,255,0.15)" strokeWidth="7" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="#facc15"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: 36, fontWeight: 900, color: '#facc15', fontFamily: 'monospace' }}>
              {secondsLeft}s
            </div>
          </div>
          <div style={{ fontSize: 72 }}>⏱️</div>
        </div>

        <h2 style={{ fontSize: 44, fontWeight: 900, color: '#ffffff', margin: 0 }}>
          {scene.title}
        </h2>

        {/* Challenge Box */}
        <div
          style={{
            backgroundColor: 'rgba(10, 16, 32, 0.95)',
            border: `3px solid #facc15`,
            borderRadius: 24,
            padding: '18px 46px',
            boxShadow: '0 12px 35px rgba(250, 204, 21, 0.45)'
          }}
        >
          <div style={{ fontSize: 18, color: '#cbd5e1', fontWeight: 800, letterSpacing: 2 }}>COBA HITUNG KILAT:</div>
          <div style={{ fontFamily: 'monospace', fontSize: 50, fontWeight: 900, color: '#facc15', marginTop: 4 }}>
            {scene.stat || "18% × 50 = ?"}
          </div>
        </div>

        <p style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.45, color: '#e2e8f0', margin: 0 }}>
          {scene.body}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// BENTUK 5: CELEBRATION STAR (PERAYAAN JAWABAN BENAR & BINTANG EMAS!)
// ==========================================
const CelebrationStarLayout = ({ scene, index, total, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 9, mass: 0.5, stiffness: 120 } });
  const exitProgress = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = 1 - exitProgress;

  // Star pulse
  const starPulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.95, 1.15]);

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      {/* Floating Confetti Stars Effect */}
      <ConfettiStars frame={frame} />

      <div
        style={{
          width: '100%',
          maxWidth: 960,
          transform: `scale(${enterSpring})`,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(30px)',
          border: `3.5px solid #10b981`,
          borderRadius: 44,
          padding: '44px 44px',
          boxShadow: `0 40px 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(16, 185, 129, 0.6)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
          zIndex: 10
        }}
      >
        <KidsSceneHeader tag={scene.tag || "🏆 LEVEL UP! JUARA KELAS"} index={index} total={total} theme={theme} />

        {/* 3 Golden Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${starPulse})` }}>
          <span style={{ fontSize: 64 }}>⭐</span>
          <span style={{ fontSize: 84 }}>⭐</span>
          <span style={{ fontSize: 64 }}>⭐</span>
        </div>

        <h2 style={{ fontSize: 46, fontWeight: 900, color: '#ffffff', margin: 0 }}>
          {scene.title}
        </h2>

        {/* Big Answer Revealed Box */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.22)',
            border: '3px solid #10b981',
            borderRadius: 24,
            padding: '18px 50px',
            boxShadow: '0 15px 40px rgba(16, 185, 129, 0.4)'
          }}
        >
          <div style={{ fontSize: 18, color: '#6ee7b7', fontWeight: 800, letterSpacing: 2 }}>JAWABAN TEPAT:</div>
          <div style={{ fontFamily: 'monospace', fontSize: 48, fontWeight: 900, color: '#fef08a', marginTop: 4 }}>
            {scene.stat || "50% × 18 = 9 (Benar 100%)"}
          </div>
        </div>

        <p style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.45, color: '#e2e8f0', margin: 0 }}>
          {scene.body}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// BENTUK 6: GEOMETRIC DIAGRAM CARD
// ==========================================
const KidsGeometricLayout = ({ scene, index, total, theme, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 11, mass: 0.6 } });
  const exitProgress = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = 1 - exitProgress;
  const dashOffset = -frame * 3;

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          transform: `scale(${enterSpring})`,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(30px)',
          border: `3px solid ${theme.borderColor}`,
          borderRadius: 44,
          padding: '40px 42px',
          boxShadow: `0 40px 90px rgba(0, 0, 0, 0.75), 0 0 45px ${theme.glowColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          textAlign: 'center'
        }}
      >
        <KidsSceneHeader tag={scene.tag || "📐 DIAGRAM GEOMETRI"} index={index} total={total} theme={theme} />

        <h2 style={{ fontSize: 42, fontWeight: 900, color: '#ffffff', margin: 0 }}>
          {scene.title}
        </h2>

        {/* SVG Triangle */}
        <div style={{ position: 'relative', width: 340, height: 210, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 10 }}>
          <svg width="320" height="190" viewBox="0 0 320 190">
            <line x1="40" y1="150" x2="260" y2="150" stroke="#38bdf8" strokeWidth="5" />
            <text x="145" y="175" fill="#38bdf8" fontSize="22" fontWeight="bold" textAnchor="middle">a = 6</text>

            <line x1="260" y1="150" x2="260" y2="30" stroke="#f472b6" strokeWidth="5" />
            <text x="290" y="95" fill="#f472b6" fontSize="22" fontWeight="bold" textAnchor="middle">b = 8</text>

            <line
              x1="40"
              y1="150"
              x2="260"
              y2="30"
              stroke={theme.accent}
              strokeWidth="6"
              strokeDasharray="8 4"
              strokeDashoffset={dashOffset}
            />
            <text x="130" y="75" fill={theme.accent} fontSize="26" fontWeight="900" textAnchor="middle">c = 10 (Miring)</text>
            <rect x="235" y="125" width="25" height="25" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: `2px solid ${theme.primary}`, borderRadius: 18, padding: '12px 34px', fontFamily: 'monospace', fontSize: 32, fontWeight: 900, color: theme.accent }}>
          {scene.stat || "a² + b² = c²  ➔  Tripel 3 - 4 - 5"}
        </div>

        <p style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.4, color: '#e2e8f0', margin: 0 }}>
          {scene.body}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SUB-KOMPONEN: KIDS SCENE HEADER & STEPPER
// ==========================================
const KidsSceneHeader = ({ tag, index, total, theme }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div
        style={{
          backgroundColor: theme.badgeBg,
          border: `2px solid ${theme.primary}`,
          color: theme.accent,
          fontSize: 20,
          fontWeight: 900,
          padding: '8px 22px',
          borderRadius: 999,
          letterSpacing: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <span>⭐</span>
        <span>{tag}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Array.from({ length: total }).map((_, stepIdx) => {
          const isActive = stepIdx === index;
          return (
            <div
              key={stepIdx}
              style={{
                width: isActive ? 34 : 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: isActive ? theme.accent : 'rgba(255, 255, 255, 0.25)',
                boxShadow: isActive ? `0 0 14px ${theme.accent}` : 'none'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// SUB-KOMPONEN: FLOATING PARTICLES & STARS
// ==========================================
const KIDS_SYMBOLS = ['⭐', '✨', 'π', '💡', '÷', '×', '🧠', '➕', '🎯', '💯', '🚀', '🔥', '🦉', '🦊', '⭐', '✨'];

const FLOATING_ITEMS = KIDS_SYMBOLS.map((symbol, i) => ({
  id: i,
  symbol,
  startX: ((i * 59) % 960) + 60,
  startY: ((i * 97) % 1800) + 50,
  speed: 0.6 + ((i * 4) % 8) * 0.12,
  size: 26 + ((i * 5) % 16),
  phase: i * 1.6
}));

const FloatingKidsParticles = ({ frame, primaryColor, accentColor }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {FLOATING_ITEMS.map((p) => {
        const currentY = (p.startY - frame * p.speed * 1.6) % 1920;
        const normalizedY = currentY < 0 ? currentY + 1920 : currentY;
        const currentX = p.startX + Math.sin((frame / 26) + p.phase) * 28;
        const opacity = interpolate(
          Math.sin((frame / 20) + p.phase),
          [-1, 1],
          [0.15, 0.45]
        );

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: normalizedY,
              fontSize: p.size,
              opacity,
              userSelect: 'none'
            }}
          >
            {p.symbol}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ==========================================
// SUB-KOMPONEN: CONFETTI STARS (UNTUK SELEBRASI)
// ==========================================
const CONFETTI_PIECES = Array.from({ length: 28 }).map((_, i) => ({
  id: i,
  x: (i * 37) % 1000,
  y: (i * 71) % 1800,
  char: ['🎉', '⭐', '✨', '🌟', '🎊', '💯'][i % 6],
  speed: 1.5 + (i % 5) * 0.4
}));

const ConfettiStars = ({ frame }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 5 }}>
      {CONFETTI_PIECES.map((c) => {
        const yPos = (c.y + frame * c.speed * 4) % 1920;
        const xPos = c.x + Math.sin((frame / 10) + c.id) * 40;
        const opacity = interpolate(Math.sin((frame / 8) + c.id), [-1, 1], [0.3, 0.9]);

        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: xPos,
              top: yPos,
              fontSize: 32,
              opacity
            }}
          >
            {c.char}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ==========================================
// SUB-KOMPONEN: TOP HEADER
// ==========================================
const TopHeader = ({ brandName, level, mascot, theme, frame }) => {
  const pulseScale = interpolate(Math.sin(frame / 10), [-1, 1], [0.95, 1.05]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 60px',
        zIndex: 50
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          backgroundColor: 'rgba(11, 18, 33, 0.90)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${theme.borderColor}`,
          padding: '10px 24px',
          borderRadius: 999,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${theme.glowColor}`
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: theme.accentGrad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: `0 0 14px ${theme.accent}`
          }}
        >
          {mascot || "🦉"}
        </div>
        <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1.5, color: '#ffffff' }}>
          {brandName}
        </span>
        <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: 16, fontWeight: 900, width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ✓
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(250, 204, 21, 0.22)',
          border: '2px solid rgba(250, 204, 21, 0.7)',
          padding: '8px 24px',
          borderRadius: 999,
          backdropFilter: 'blur(16px)'
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#facc15',
            boxShadow: '0 0 14px #facc15',
            transform: `scale(${pulseScale})`
          }}
        />
        <span style={{ fontSize: 20, fontWeight: 900, color: '#fef08a', letterSpacing: 1.5 }}>
          {level || '🎒 LEVEL SD & SMP'}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// SUB-KOMPONEN: HOOK PEMBUKA RAMAH ANAK (4 DETIK)
// ==========================================
const HookKidsSection = ({ hookText, mascot, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 9, mass: 0.5, stiffness: 120 } });
  const mascotBounce = Math.sin(frame / 6) * 16;
  const exitOpacity = interpolate(frame, [100, 118], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 60px', opacity: exitOpacity }}>
      <div style={{ transform: `scale(${enterSpring})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center', zIndex: 10 }}>
        {/* Mascot Header */}
        <div style={{ fontSize: 96, transform: `translateY(${mascotBounce}px)`, filter: 'drop-shadow(0 10px 25px rgba(250,204,21,0.6))' }}>
          {mascot || "🦉"}
        </div>

        <div
          style={{
            backgroundColor: '#facc15',
            color: '#000000',
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 3,
            padding: '12px 36px',
            borderRadius: 999,
            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span>⭐</span>
          <span>RAHASIA JUARA KELAS</span>
          <span>⭐</span>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(10, 16, 32, 0.95)',
            backdropFilter: 'blur(30px)',
            border: `3.5px solid ${theme.borderColor}`,
            borderRadius: 40,
            padding: '44px 50px',
            boxShadow: `0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px ${theme.glowColor}`,
            maxWidth: 960
          }}
        >
          <h1
            style={{
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: -1,
              background: 'linear-gradient(180deg, #ffffff 30%, #fef08a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 30px rgba(0,0,0,0.8)'
            }}
          >
            {hookText}
          </h1>

          <div style={{ marginTop: 20, fontSize: 30, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: 2 }}>
            ⚡ Trik 1 Menit Yang Bikin Matematika Jadi Super Mudah! ⚡
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SUB-KOMPONEN: CTA OUTRO SERU (5 DETIK)
// ==========================================
const CtaKidsSection = ({ ctaText, brandName, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 9, mass: 0.5, stiffness: 110 } });
  const bellAngle = Math.sin(frame * 0.5) * 16;
  const pulseButton = interpolate(Math.sin(frame / 6), [-1, 1], [1, 1.05]);

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 60px', backgroundColor: 'rgba(5, 8, 16, 0.92)', backdropFilter: 'blur(30px)' }}>
      <ConfettiStars frame={frame} />

      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          maxWidth: 960,
          backgroundColor: theme.cardBg,
          border: `3px solid ${theme.borderColor}`,
          borderRadius: 44,
          padding: '54px 48px',
          boxShadow: `0 40px 100px rgba(0, 0, 0, 0.8), 0 0 60px ${theme.glowColor}`,
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 72 }}>🌟</span>
          <div style={{ fontSize: 88, transform: `rotate(${bellAngle}deg)`, display: 'inline-block', filter: 'drop-shadow(0 0 25px rgba(250, 204, 21, 0.7))' }}>
            🔔
          </div>
          <span style={{ fontSize: 72 }}>🚀</span>
        </div>

        <div style={{ fontSize: 50, fontWeight: 900, color: '#ffffff', lineHeight: 1.25, textShadow: '0 6px 25px rgba(0,0,0,0.8)' }}>
          {ctaText}
        </div>

        <div
          style={{
            transform: `scale(${pulseButton})`,
            background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #38bdf8 100%)',
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 900,
            padding: '22px 54px',
            borderRadius: 999,
            boxShadow: '0 16px 45px rgba(245, 158, 11, 0.65)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <span>👉</span>
          <span>FOLLOW & SUBSCRIBE {brandName}</span>
          <span>👈</span>
        </div>

        <div style={{ fontSize: 24, fontWeight: 700, color: '#cbd5e1', letterSpacing: 1 }}>
          Tulis jawabanmu di kolom komentar dan bagikan ke teman sekelasmu! 💬🎒
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SUB-KOMPONEN: BOTTOM PROGRESS BAR
// ==========================================
const BottomProgressBar = ({ progress, theme }) => {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, backgroundColor: 'rgba(255, 255, 255, 0.1)', zIndex: 100 }}>
      <div style={{ width: `${progress}%`, height: '100%', background: theme.progressGrad, boxShadow: `0 0 20px ${theme.primary}`, position: 'relative' }}>
        <div style={{ position: 'absolute', right: -8, top: -4, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: `0 0 16px ${theme.primary}, 0 0 24px #ffffff` }} />
      </div>
    </div>
  );
};
