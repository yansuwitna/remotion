const path = require('path');
const fs = require('fs');
const aiGenerator = require('./ai-generator');
const remotionService = require('./remotion-service');
const ttsService = require('./tts-service');
const youtubeUploader = require('./youtube-uploader');
const tiktokUploader = require('./tiktok-uploader');

/**
 * Orchestrator Utama:
 * 1. Menerima Waktu & Topik
 * 2. Generate naskah & kode props Remotion via AI
 * 3. Render video secara otomatis dengan Remotion
 * 4. Generate judul & deskripsi viral
 * 5. Langsung unggah otomatis ke YouTube Shorts & TikTok
 */
class PipelineOrchestrator {
  constructor() {
    this.logsPath = path.join(__dirname, '..', 'data', 'logs.json');
    this.settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    this.schedulesPath = path.join(__dirname, '..', 'data', 'schedules.json');
    this.activeJobs = new Map(); // Untuk tracking status real-time
  }

  getSettings() {
    try {
      const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8'));
      if (!settings.geminiApiKey && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
        settings.geminiApiKey = process.env.GEMINI_API_KEY;
      }
      return settings;
    } catch {
      return {
        geminiApiKey: (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') ? process.env.GEMINI_API_KEY : ''
      };
    }
  }

  saveLogs(logEntry) {
    try {
      let logs = [];
      if (fs.existsSync(this.logsPath)) {
        logs = JSON.parse(fs.readFileSync(this.logsPath, 'utf-8') || '[]');
      }
      // Hapus jika sudah ada entri dengan id sama
      logs = logs.filter((l) => l.id !== logEntry.id);
      logs.unshift(logEntry);
      // Batasi simpan 100 log terakhir
      if (logs.length > 100) logs = logs.slice(0, 100);
      fs.writeFileSync(this.logsPath, JSON.stringify(logs, null, 2));
    } catch (err) {
      console.error('[Logs Error] Gagal menyimpan log:', err.message);
    }
  }

  updateScheduleStatus(scheduleId, status, lastRun = new Date().toISOString()) {
    try {
      if (!fs.existsSync(this.schedulesPath)) return;
      const schedules = JSON.parse(fs.readFileSync(this.schedulesPath, 'utf-8') || '[]');
      const index = schedules.findIndex((s) => s.id === scheduleId);
      if (index !== -1) {
        schedules[index].status = status;
        if (lastRun) schedules[index].lastRun = lastRun;
        fs.writeFileSync(this.schedulesPath, JSON.stringify(schedules, null, 2));
      }
    } catch (err) {
      console.error('[Schedule Error] Gagal update status jadwal:', err.message);
    }
  }

  /**
   * Memulai pipeline secara asynchronous dan mengembalikan jobId langsung
   * agar frontend dapat melakukan real-time polling progress (0 - 100%).
   */
  startPipeline({ scheduleId = null, topic, platforms = ['youtube', 'tiktok'], triggerType = 'manual', requireApproval = true }) {
    const videoId = `vid_${Date.now()}`;
    const startTime = new Date();

    const jobStatus = {
      id: videoId,
      scheduleId,
      topic,
      platforms,
      triggerType,
      requireApproval,
      step: 'STARTING',
      progress: 5,
      message: 'Memulai pipeline pembuatan video matematika...',
      startedAt: startTime.toISOString(),
      generatedContent: null,
      remotionProps: null,
      videoFile: null,
      videoPublicUrl: null,
      youtubeResult: null,
      tiktokResult: null,
      error: null
    };

    this.activeJobs.set(videoId, jobStatus);
    if (scheduleId) this.updateScheduleStatus(scheduleId, 'processing');

    console.log(`\n======================================================`);
    console.log(`🚀 [PIPELINE START] ID: ${videoId} | Trigger: ${triggerType}`);
    console.log(`📌 Topik: "${topic}"`);
    console.log(`🎯 Platform: ${platforms.join(', ')}`);
    console.log(`🛡️ Persetujuan User Diperlukan: ${requireApproval ? 'Ya (2 Checkpoints)' : 'Tidak (Auto-Run)'}`);
    console.log(`======================================================\n`);

    // Eksekusi tahap awal (AI Generation)
    this.executePipeline(videoId, { scheduleId, topic, platforms, triggerType, startTime, requireApproval })
      .catch((err) => {
        console.error(`[Pipeline Background Error] ID ${videoId}:`, err.message);
      });

    return { jobId: videoId, jobStatus };
  }

  /**
   * Eksekusi Tahap 1: Generate Naskah AI
   */
  async executePipeline(videoId, { scheduleId, topic, platforms, triggerType, startTime, requireApproval = true }) {
    const jobStatus = this.activeJobs.get(videoId);

    try {
      const settings = this.getSettings();

      // 1. Generate Kode Props & Naskah AI
      jobStatus.step = 'AI_GENERATION';
      jobStatus.progress = 15;
      jobStatus.message = 'AI Gemini sedang merangkai naskah 1 menit & konsep matematika...';

      const aiContent = await aiGenerator.generateVideoContent(topic, settings.geminiApiKey);

      jobStatus.generatedContent = {
        youtubeTitle: aiContent.youtubeTitle,
        tiktokTitle: aiContent.tiktokTitle,
        description: aiContent.description,
        tags: aiContent.tags,
        level: aiContent.remotionProps?.level || '🎒 LEVEL MATEMATIKA',
        mascot: aiContent.remotionProps?.mascot || '🦉',
        theme: aiContent.remotionProps?.theme || 'kids-arcade',
        hook: aiContent.remotionProps?.hook || '',
        ctaText: aiContent.remotionProps?.ctaText || '',
        scenes: aiContent.remotionProps?.scenes || []
      };
      jobStatus.remotionProps = aiContent.remotionProps;

      // CHECKPOINT 1: Jika butuh persetujuan user sebelum render
      if (requireApproval) {
        jobStatus.step = 'AWAITING_RENDER_APPROVAL';
        jobStatus.progress = 25;
        jobStatus.message = 'Naskah AI selesai dibuat! Silakan tinjau naskah dan pilih apakah ingin menjadikannya video.';
        console.log(`\n⏸️ [CHECKPOINT 1] Naskah AI siap untuk ID: ${videoId}. Menunggu persetujuan render dari user.`);
        return jobStatus;
      }

      // Jika tanpa persetujuan (unattended automated schedule), langsung lanjut render
      return await this.proceedWithRender(videoId);
    } catch (err) {
      console.error(`❌ [PIPELINE AI FAILED] ID ${videoId} Error:`, err.message);
      jobStatus.step = 'FAILED';
      jobStatus.progress = 100;
      jobStatus.error = err.message;
      jobStatus.message = `Gagal naskah AI: ${err.message}`;

      this.saveLogs({
        ...jobStatus,
        status: 'error'
      });

      if (scheduleId) this.updateScheduleStatus(scheduleId, 'error');
      throw err;
    }
  }

  /**
   * Checkpoint 1 Approval: User menyetujui naskah dan meminta render video
   */
  approveRender(videoId) {
    const jobStatus = this.activeJobs.get(videoId);
    if (!jobStatus) throw new Error('Job tidak ditemukan.');
    if (jobStatus.step !== 'AWAITING_RENDER_APPROVAL') {
      throw new Error(`Job tidak sedang menunggu persetujuan render (status saat ini: ${jobStatus.step}).`);
    }

    console.log(`\n▶️ [CHECKPOINT 1 APPROVED] User menyetujui naskah untuk ID: ${videoId}. Memulai sintesis audio & render Remotion...`);

    // Lanjutkan proses render di background
    this.proceedWithRender(videoId).catch((err) => {
      console.error(`[Proceed Render Error] ID ${videoId}:`, err.message);
    });

    return {
      success: true,
      jobId: videoId,
      message: 'Naskah disetujui! Proses render video dan suara narasi telah dimulai.'
    };
  }

  /**
   * Eksekusi Tahap 2: Sintesis Audio & Render Video Remotion
   */
  async proceedWithRender(videoId) {
    const jobStatus = this.activeJobs.get(videoId);
    if (!jobStatus) throw new Error('Job tidak ditemukan.');

    try {
      // 1.5 Generate Suara Narasi / Pengarah Suara (TTS Bahasa Indonesia)
      jobStatus.step = 'VOICE_SYNTHESIS';
      jobStatus.progress = 30;
      jobStatus.message = 'Menghasilkan suara narasi pengarah (TTS Bahasa Indonesia)...';

      try {
        const audioConfig = await ttsService.generateVoicePackage(videoId, jobStatus.remotionProps);
        jobStatus.remotionProps.audio = audioConfig;
        console.log(`[Pipeline] Paket audio suara narasi siap untuk video ID: ${videoId}`);
      } catch (ttsErr) {
        console.warn('[Pipeline Notice] TTS generator warning:', ttsErr.message);
      }

      // 2. Render Video Menggunakan Remotion (Akselerasi GPU Eksternal)
      jobStatus.step = 'RENDERING';
      jobStatus.progress = 35;
      jobStatus.message = 'Mem-bundle Remotion dan menyiapkan frame video dengan akselerasi GPU...';

      const renderResult = await remotionService.renderVideo(
        videoId,
        jobStatus.remotionProps,
        (progressPercent, message) => {
          // Petakan progress render Remotion (35% s/d 85%)
          jobStatus.progress = Math.min(85, Math.max(35, progressPercent));
          jobStatus.message = message || 'Sedang merender video dengan GPU...';
        }
      );

      jobStatus.videoFile = renderResult.filePath;
      jobStatus.videoPublicUrl = renderResult.publicUrl;

      // CHECKPOINT 2: Jika butuh persetujuan user sebelum upload
      if (jobStatus.requireApproval) {
        jobStatus.step = 'AWAITING_UPLOAD_APPROVAL';
        jobStatus.progress = 85;
        jobStatus.message = 'Video berhasil dirender! Tonton preview dan tentukan apakah ingin langsung di-upload.';
        console.log(`\n⏸️ [CHECKPOINT 2] Video siap untuk ID: ${videoId}. Menunggu persetujuan upload dari user.`);
        return jobStatus;
      }

      // Jika tanpa persetujuan, langsung upload
      return await this.proceedWithUpload(videoId, jobStatus.platforms);
    } catch (err) {
      console.error(`❌ [PIPELINE RENDER FAILED] ID ${videoId} Error:`, err.message);
      jobStatus.step = 'FAILED';
      jobStatus.progress = 100;
      jobStatus.error = err.message;
      jobStatus.message = `Gagal render video: ${err.message}`;

      this.saveLogs({
        ...jobStatus,
        status: 'error'
      });

      if (jobStatus.scheduleId) this.updateScheduleStatus(jobStatus.scheduleId, 'error');
      throw err;
    }
  }

  /**
   * Checkpoint 2 Approval: User menyetujui video dan meminta upload ke YouTube/TikTok
   */
  approveUpload(videoId, selectedPlatforms = null) {
    const jobStatus = this.activeJobs.get(videoId);
    if (!jobStatus) throw new Error('Job tidak ditemukan.');
    if (jobStatus.step !== 'AWAITING_UPLOAD_APPROVAL') {
      throw new Error(`Job tidak sedang menunggu persetujuan upload (status saat ini: ${jobStatus.step}).`);
    }

    const platforms = selectedPlatforms || jobStatus.platforms || ['youtube', 'tiktok'];
    jobStatus.platforms = platforms;

    console.log(`\n▶️ [CHECKPOINT 2 APPROVED] User menyetujui upload untuk ID: ${videoId} ke: ${platforms.join(', ')}.`);

    // Lanjutkan upload di background
    this.proceedWithUpload(videoId, platforms).catch((err) => {
      console.error(`[Proceed Upload Error] ID ${videoId}:`, err.message);
    });

    return {
      success: true,
      jobId: videoId,
      message: 'Upload video disetujui! Proses publikasi sedang berjalan.'
    };
  }

  /**
   * Eksekusi Tahap 3: Upload ke YouTube / TikTok
   */
  async proceedWithUpload(videoId, platforms) {
    const jobStatus = this.activeJobs.get(videoId);
    if (!jobStatus) throw new Error('Job tidak ditemukan.');

    try {
      const settings = this.getSettings();
      jobStatus.step = 'UPLOADING';
      jobStatus.progress = 88;
      jobStatus.message = 'Menyiapkan publikasi ke platform pilihan...';

      // Upload ke YouTube jika dipilih
      if (platforms.includes('youtube') && settings.youtube?.enabled !== false) {
        try {
          console.log('[Pipeline] Mengunggah ke YouTube Shorts...');
          const ytRes = await youtubeUploader.uploadVideo(
            jobStatus.videoFile,
            {
              title: jobStatus.generatedContent.youtubeTitle,
              description: jobStatus.generatedContent.description,
              tags: jobStatus.generatedContent.tags,
              privacyStatus: settings.youtube?.defaultPrivacy || 'public'
            },
            settings.youtube
          );
          jobStatus.youtubeResult = ytRes;
        } catch (ytErr) {
          console.error('[Pipeline] YouTube Upload Error:', ytErr.message);
          jobStatus.youtubeResult = { success: false, error: ytErr.message };
        }
      }

      // Upload ke TikTok jika dipilih
      if (platforms.includes('tiktok') && settings.tiktok?.enabled !== false) {
        try {
          console.log('[Pipeline] Mengunggah ke TikTok...');
          const ttRes = await tiktokUploader.uploadVideo(
            jobStatus.videoFile,
            {
              tiktokTitle: jobStatus.generatedContent.tiktokTitle,
              tags: jobStatus.generatedContent.tags
            },
            settings.tiktok
          );
          jobStatus.tiktokResult = ttRes;
        } catch (ttErr) {
          console.error('[Pipeline] TikTok Upload Error:', ttErr.message);
          jobStatus.tiktokResult = { success: false, error: ttErr.message };
        }
      }

      // 4. Selesai & Simpan Log
      const endTime = new Date();
      jobStatus.step = 'COMPLETED';
      jobStatus.progress = 100;
      jobStatus.message = 'Video berhasil dipublikasikan dan tersimpan!';
      jobStatus.completedAt = endTime.toISOString();
      jobStatus.durationMs = endTime - new Date(jobStatus.startedAt);

      console.log(`\n🎉 [PIPELINE SUCCESS] ID ${videoId} Selesai dalam ${Math.round(jobStatus.durationMs / 1000)} detik!`);

      this.saveLogs({
        ...jobStatus,
        status: 'success'
      });

      if (jobStatus.scheduleId) this.updateScheduleStatus(jobStatus.scheduleId, 'idle');
      return jobStatus;
    } catch (err) {
      console.error(`❌ [PIPELINE UPLOAD FAILED] ID ${videoId} Error:`, err.message);
      jobStatus.step = 'FAILED';
      jobStatus.progress = 100;
      jobStatus.error = err.message;
      jobStatus.message = `Gagal upload: ${err.message}`;

      this.saveLogs({
        ...jobStatus,
        status: 'error'
      });

      if (jobStatus.scheduleId) this.updateScheduleStatus(jobStatus.scheduleId, 'error');
      throw err;
    } finally {
      // Simpan di activeJobs selama 30 menit agar user tetap bisa melihat status
      setTimeout(() => {
        this.activeJobs.delete(videoId);
      }, 1800000);
    }
  }

  /**
   * User memilih simpan video saja tanpa di-upload
   */
  skipUpload(videoId) {
    const jobStatus = this.activeJobs.get(videoId);
    if (!jobStatus) throw new Error('Job tidak ditemukan.');

    const endTime = new Date();
    jobStatus.step = 'COMPLETED';
    jobStatus.progress = 100;
    jobStatus.message = 'Video berhasil disimpan di server (tanpa di-upload).';
    jobStatus.completedAt = endTime.toISOString();
    jobStatus.durationMs = endTime - new Date(jobStatus.startedAt);

    this.saveLogs({
      ...jobStatus,
      status: 'success',
      uploaded: false
    });

    if (jobStatus.scheduleId) this.updateScheduleStatus(jobStatus.scheduleId, 'idle');
    return { success: true, message: 'Video tersimpan di server tanpa di-upload.' };
  }

  /**
   * User membatalkan proses (misal menolak naskah AI)
   */
  cancelJob(videoId) {
    const jobStatus = this.activeJobs.get(videoId);
    if (!jobStatus) throw new Error('Job tidak ditemukan.');

    jobStatus.step = 'CANCELLED';
    jobStatus.progress = 0;
    jobStatus.message = 'Proses dibatalkan oleh pengguna.';

    this.saveLogs({
      ...jobStatus,
      status: 'cancelled'
    });

    if (jobStatus.scheduleId) this.updateScheduleStatus(jobStatus.scheduleId, 'idle');
    return { success: true, message: 'Proses berhasil dibatalkan.' };
  }

  /**
   * Jalankan alur dan tunggu sampai selesai (untuk backward compatibility scheduler)
   */
  async runPipeline(params) {
    const { jobId } = this.startPipeline(params);
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const job = this.getActiveJob(jobId);
        if (!job) {
          clearInterval(interval);
          resolve(null);
        } else if (job.step === 'COMPLETED') {
          clearInterval(interval);
          resolve(job);
        } else if (job.step === 'FAILED') {
          clearInterval(interval);
          reject(new Error(job.error || 'Pipeline gagal dieksekusi.'));
        }
      }, 1000);
    });
  }

  getActiveJob(id) {
    return this.activeJobs.get(id);
  }

  getAllActiveJobs() {
    return Array.from(this.activeJobs.values()).filter((j) => j.step !== 'COMPLETED' && j.step !== 'FAILED');
  }
}

module.exports = new PipelineOrchestrator();
