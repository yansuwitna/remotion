const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const pipelineOrchestrator = require('./services/pipeline-orchestrator');

/**
 * Mesin Penjadwalan Otomatis:
 * Memeriksa jadwal secara berkala dan menjalankan pipeline otomatisasi
 * jika waktu sekarang cocok dengan waktu yang diatur user.
 */
class AutoScheduler {
  constructor() {
    this.schedulesPath = path.join(__dirname, 'data', 'schedules.json');
    this.topicBankPath = path.join(__dirname, 'data', 'topic-bank.json');
    this.settingsPath = path.join(__dirname, 'data', 'settings.json');
    this.lastTriggeredMinutes = new Set(); // Mencegah double-execution dalam 1 menit yang sama
  }

  start() {
    console.log('[Scheduler] Mesin penjadwalan waktu Remotion aktif (berjalan setiap 30 detik)...');
    
    // Periksa jadwal setiap 30 detik
    cron.schedule('*/30 * * * * *', async () => {
      await this.checkAndTriggerSchedules();
    });
  }

  getSchedules() {
    try {
      if (!fs.existsSync(this.schedulesPath)) return [];
      return JSON.parse(fs.readFileSync(this.schedulesPath, 'utf-8') || '[]');
    } catch {
      return [];
    }
  }

  getNextTopicFromBank() {
    try {
      if (!fs.existsSync(this.topicBankPath)) return null;
      const bank = JSON.parse(fs.readFileSync(this.topicBankPath, 'utf-8') || '[]');
      if (bank.length === 0) return null;
      // Ambil topik teratas dan rotasikan ke bawah
      const selected = bank.shift();
      bank.push(selected);
      fs.writeFileSync(this.topicBankPath, JSON.stringify(bank, null, 2));
      return selected;
    } catch {
      return null;
    }
  }

  async checkAndTriggerSchedules() {
    const schedules = this.getSchedules();
    if (!schedules || schedules.length === 0) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const currentDateStr = now.toISOString().split('T')[0];
    const currentKey = `${currentDateStr}_${currentTimeStr}`;

    for (const schedule of schedules) {
      if (!schedule.enabled) continue;

      let shouldTrigger = false;

      // 1. Tipe Jadwal Harian (Daily at HH:mm)
      if (schedule.timeType === 'daily' && schedule.timeValue === currentTimeStr) {
        const triggerId = `${schedule.id}_${currentKey}`;
        if (!this.lastTriggeredMinutes.has(triggerId)) {
          this.lastTriggeredMinutes.add(triggerId);
          shouldTrigger = true;
        }
      }

      // 2. Tipe Tanggal & Waktu Spesifik (YYYY-MM-DDTHH:mm)
      else if (schedule.timeType === 'datetime') {
        const targetDateTime = schedule.timeValue.slice(0, 16);
        const nowDateTime = `${currentDateStr}T${currentTimeStr}`;
        if (targetDateTime === nowDateTime) {
          const triggerId = `${schedule.id}_${currentKey}`;
          if (!this.lastTriggeredMinutes.has(triggerId)) {
            this.lastTriggeredMinutes.add(triggerId);
            shouldTrigger = true;
          }
        }
      }

      if (shouldTrigger) {
        console.log(`\n⏰ [WAKTU COCOK] Jadwal "${schedule.title}" (${schedule.timeValue}) terpenuhi pada ${currentTimeStr}!`);
        
        let topicToUse = schedule.topic;
        // Jika topik kosong atau diset 'auto', ambil dari topic bank
        if (!topicToUse || topicToUse.toLowerCase() === 'auto') {
          topicToUse = this.getNextTopicFromBank() || 'Fakta Menarik Sains dan Teknologi Terkini';
        }

        // Jalankan pipeline di background tanpa memblokir scheduler
        pipelineOrchestrator.runPipeline({
          scheduleId: schedule.id,
          topic: topicToUse,
          platforms: schedule.platforms || ['youtube', 'tiktok'],
          triggerType: 'scheduled'
        }).catch((err) => {
          console.error(`[Scheduler Job Error]: ${err.message}`);
        });
      }
    }

    // Bersihkan cache trigger menit yang sudah lama (lewat dari 2 jam)
    if (this.lastTriggeredMinutes.size > 200) {
      this.lastTriggeredMinutes.clear();
    }
  }
}

module.exports = new AutoScheduler();
