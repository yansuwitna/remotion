require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const autoScheduler = require('./scheduler');
const pipelineOrchestrator = require('./services/pipeline-orchestrator');
const youtubeUploader = require('./services/youtube-uploader');
const gpuDetector = require('./services/gpu-detector');
const aiGenerator = require('./services/ai-generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Path data
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SETTINGS_EXAMPLE_FILE = path.join(DATA_DIR, 'settings.example.json');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const TOPICS_FILE = path.join(DATA_DIR, 'topic-bank.json');

// Inisialisasi settings.json dari template jika belum ada
if (!fs.existsSync(SETTINGS_FILE) && fs.existsSync(SETTINGS_EXAMPLE_FILE)) {
  try {
    fs.copyFileSync(SETTINGS_EXAMPLE_FILE, SETTINGS_FILE);
  } catch (err) {
    console.warn('[Settings Init] Gagal membuat settings.json dari template:', err.message);
  }
}

// Helper membaca dan menulis file data
const readJson = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8') || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// ==========================================
// 1. SYSTEM & STATUS API
// ==========================================
app.get('/api/status', (req, res) => {
  const now = new Date();
  const schedules = readJson(SCHEDULES_FILE, []);
  const logs = readJson(LOGS_FILE, []);
  const activeSchedules = schedules.filter((s) => s.enabled);

  res.json({
    status: 'online',
    serverTime: now.toISOString(),
    displayTime: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    displayDate: now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    totalSchedules: schedules.length,
    activeSchedulesCount: activeSchedules.length,
    totalCompletedVideos: logs.filter((l) => l.status === 'success').length,
    recentLog: logs[0] || null
  });
});

// ==========================================
// 2. SCHEDULES (JADWAL) API
// ==========================================
app.get('/api/schedules', (req, res) => {
  res.json(readJson(SCHEDULES_FILE, []));
});

app.post('/api/schedules', (req, res) => {
  const { title, topic, timeType, timeValue, platforms, enabled } = req.body;
  if (!title || !timeValue) {
    return res.status(400).json({ error: 'Judul jadwal dan waktu wajib diisi.' });
  }

  const schedules = readJson(SCHEDULES_FILE, []);
  const newSchedule = {
    id: `sched_${Date.now()}`,
    title,
    topic: topic || 'auto',
    timeType: timeType || 'daily',
    timeValue,
    platforms: platforms || ['youtube', 'tiktok'],
    enabled: enabled !== false,
    lastRun: null,
    nextRun: null,
    status: 'idle'
  };

  schedules.push(newSchedule);
  writeJson(SCHEDULES_FILE, schedules);
  res.status(201).json(newSchedule);
});

app.put('/api/schedules/:id', (req, res) => {
  const schedules = readJson(SCHEDULES_FILE, []);
  const index = schedules.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
  }

  schedules[index] = {
    ...schedules[index],
    ...req.body,
    id: schedules[index].id
  };

  writeJson(SCHEDULES_FILE, schedules);
  res.json(schedules[index]);
});

app.delete('/api/schedules/:id', (req, res) => {
  let schedules = readJson(SCHEDULES_FILE, []);
  schedules = schedules.filter((s) => s.id !== req.params.id);
  writeJson(SCHEDULES_FILE, schedules);
  res.json({ success: true, message: 'Jadwal berhasil dihapus' });
});

// Trigger Eksekusi Jadwal Seketika (Run Now / Uji Coba)
app.post('/api/schedules/:id/run', async (req, res) => {
  const schedules = readJson(SCHEDULES_FILE, []);
  const schedule = schedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
  }

  let topic = schedule.topic;
  if (!topic || topic.toLowerCase() === 'auto') {
    const topics = readJson(TOPICS_FILE, []);
    topic = topics[0] || '[SD] Trik Ajaib Menghitung Persen 16% dari 50';
  }

  // Mulai pipeline dengan tracking jobId
  const { jobId, jobStatus } = pipelineOrchestrator.startPipeline({
    scheduleId: schedule.id,
    topic,
    platforms: schedule.platforms || ['youtube', 'tiktok'],
    triggerType: 'manual_schedule_trigger'
  });

  res.json({
    success: true,
    jobId,
    topic,
    message: `Pipeline untuk jadwal "${schedule.title}" sedang diproses di background.`
  });
});

// ==========================================
// 3. MANUAL INSTANT GENERATOR API
// ==========================================
app.post('/api/generate-now', async (req, res) => {
  const { topic, platforms } = req.body;
  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Topik video wajib diisi.' });
  }

  try {
    const { jobId, jobStatus } = pipelineOrchestrator.startPipeline({
      topic: topic.trim(),
      platforms: platforms || ['youtube', 'tiktok'],
      triggerType: 'manual_instant'
    });

    res.json({
      success: true,
      jobId,
      message: 'Proses generate video dan upload otomatis telah dimulai!',
      topic
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Polling status job aktif
app.get('/api/jobs/:id', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const job = pipelineOrchestrator.getActiveJob(req.params.id);
  if (!job) {
    // Cari di logs file jika job di memori sudah selesai
    const logs = readJson(LOGS_FILE, []);
    const finishedLog = logs.find((l) => l.id === req.params.id);
    if (finishedLog) {
      return res.json(finishedLog);
    }
    return res.status(404).json({ error: 'Job tidak ditemukan atau telah selesai.' });
  }
  res.json(job);
});

// Mengambil semua job yang sedang aktif berjalan
app.get('/api/active-jobs', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json(pipelineOrchestrator.getAllActiveJobs());
});

// Checkpoint 1: Setujui naskah AI & lanjut render video
app.post('/api/jobs/:id/approve-render', (req, res) => {
  try {
    const result = pipelineOrchestrator.approveRender(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Checkpoint 2: Setujui video hasil render & lanjut upload ke platform
app.post('/api/jobs/:id/approve-upload', (req, res) => {
  try {
    const { platforms } = req.body;
    const result = pipelineOrchestrator.approveUpload(req.params.id, platforms);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Checkpoint 2: Simpan video saja (tanpa upload)
app.post('/api/jobs/:id/skip-upload', (req, res) => {
  try {
    const result = pipelineOrchestrator.skipUpload(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pembatalan Job (Batal naskah / Batal proses)
app.post('/api/jobs/:id/cancel', (req, res) => {
  try {
    const result = pipelineOrchestrator.cancelJob(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 4. TOPIC BANK & AI TOPIC SEARCH API
// ==========================================
app.get('/api/topics', (req, res) => {
  res.json(readJson(TOPICS_FILE, []));
});

app.post('/api/topics', (req, res) => {
  const { topics } = req.body;
  if (!Array.isArray(topics)) {
    return res.status(400).json({ error: 'Data topik harus berupa array string.' });
  }
  writeJson(TOPICS_FILE, topics);
  res.json({ success: true, count: topics.length });
});

// Endpoint Pencarian / Rekomendasi Topik Menggunakan AI
app.post('/api/topics/ai-search', async (req, res) => {
  const { query, level } = req.body || {};
  try {
    const settings = readJson(SETTINGS_FILE, {});
    const topics = await aiGenerator.searchTopicsWithAi(query, level, settings.geminiApiKey);
    res.json({
      success: true,
      query: query || '',
      level: level || 'SEMUA',
      count: topics.length,
      topics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. SETTINGS API
// ==========================================
app.get('/api/settings', (req, res) => {
  const settings = readJson(SETTINGS_FILE, {});
  // Fallback ke .env jika belum diisi di settings.json
  if (!settings.geminiApiKey && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
    settings.geminiApiKey = process.env.GEMINI_API_KEY;
  }
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const currentSettings = readJson(SETTINGS_FILE, {});
  const updatedSettings = {
    ...currentSettings,
    ...req.body
  };
  writeJson(SETTINGS_FILE, updatedSettings);
  res.json({ success: true, settings: updatedSettings });
});

// ==========================================
// 6. SYSTEM & GPU HARDWARE DETECTION API
// ==========================================
app.get('/api/system/gpu', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const gpuInfo = gpuDetector.getGpuInfo();
    res.json(gpuInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. LOGS & OUTPUTS API
// ==========================================
app.get('/api/logs', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json(readJson(LOGS_FILE, []));
});

// ==========================================
// 7. YOUTUBE OAUTH2 HELPER
// ==========================================
app.get('/api/youtube/auth-url', (req, res) => {
  const settings = readJson(SETTINGS_FILE, {});
  const yt = settings.youtube || {};
  if (!yt.clientId || !yt.clientSecret) {
    return res.status(400).json({
      error: 'Harap masukkan YouTube Client ID dan Client Secret terlebih dahulu di Pengaturan.'
    });
  }

  const redirectUri = yt.redirectUri || `http://localhost:${PORT}/api/youtube/callback`;
  const url = youtubeUploader.getAuthUrl(yt.clientId, yt.clientSecret, redirectUri);
  res.json({ authUrl: url });
});

app.get('/api/youtube/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.send('<h3>Otorisasi Dibatalkan atau Code tidak ditemukan.</h3>');
  }

  try {
    const settings = readJson(SETTINGS_FILE, {});
    const yt = settings.youtube || {};
    const redirectUri = yt.redirectUri || `http://localhost:${PORT}/api/youtube/callback`;

    const tokens = await youtubeUploader.getTokensFromCode(
      code,
      yt.clientId,
      yt.clientSecret,
      redirectUri
    );

    if (tokens.refresh_token) {
      settings.youtube.refreshToken = tokens.refresh_token;
      writeJson(SETTINGS_FILE, settings);
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #16a34a;">✅ Berhasil Terhubung ke YouTube!</h2>
          <p>Refresh Token YouTube Anda berhasil disimpan secara otomatis ke dalam pengaturan.</p>
          <a href="/" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Kembali ke Dashboard</a>
        </div>
      `);
    } else {
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #eab308;">⚠️ Akses Berhasil Diperoleh</h2>
          <p>Namun Refresh Token tidak disertakan (sudah pernah diizinkan sebelumnya). Pastikan akun baru atau cabut akses terlebih dahulu di pengaturan akun Google.</p>
          <a href="/" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Kembali ke Dashboard</a>
        </div>
      `);
    }
  } catch (err) {
    res.status(500).send(`<h3>Gagal menukarkan token:</h3><pre>${err.message}</pre>`);
  }
});

// Fallback route untuk Single Page App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server & aktifkan scheduler
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎬 REMOTION VIDEO AUTOMATION STUDIO BERJALAN`);
  console.log(`🌐 Buka di Browser: http://localhost:${PORT}`);
  console.log(`======================================================\n`);

  // Start background auto scheduler
  autoScheduler.start();
});
