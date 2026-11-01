// State Management
let currentTab = 'tab-dashboard';
let activePollingInterval = null;

// ==========================================
// 1. INITIALIZATION & CLOCK
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  loadGpuInfo();
  loadDashboardData();
  loadSchedules();
  loadTopicBank();
  loadLogs();
  loadSettings();
});

async function loadGpuInfo() {
  try {
    const res = await fetch('/api/system/gpu');
    if (!res.ok) return;
    const gpu = await res.json();

    const nameEl = document.getElementById('gpuNameDisplay');
    const badgeEl = document.getElementById('gpuBadgeDisplay');
    const statusTextEl = document.getElementById('gpuStatusText');
    const genGpuNameEl = document.getElementById('genGpuName');

    if (nameEl) {
      nameEl.innerText = gpu.activeGpuName || 'Standard Video Card';
      nameEl.title = `${gpu.activeGpuName} (VRAM: ${gpu.vram || 'N/A'}, Driver: ${gpu.driverVersion || 'N/A'})`;
    }

    if (badgeEl && statusTextEl) {
      if (gpu.hasDedicatedGpu) {
        statusTextEl.innerText = `${gpu.vram ? gpu.vram.split(' ')[0] + ' VRAM' : 'Dedicated'} • ANGLE GPU Aktif`;
      } else {
        statusTextEl.innerText = 'Standard GPU Aktif';
      }
    }

    if (genGpuNameEl) {
      genGpuNameEl.innerText = gpu.hasDedicatedGpu ? `GPU: ${gpu.activeGpuName}` : 'Akselerasi GPU Aktif';
    }

    lucide.createIcons();
  } catch (err) {
    console.warn('Gagal memuat info GPU:', err);
  }
}

function updateLiveClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const clockEl = document.getElementById('liveClock');
  if (clockEl) clockEl.innerText = timeStr;
}

// ==========================================
// 2. TAB SWITCHING
// ==========================================
function switchTab(tabId) {
  currentTab = tabId;

  // Sembunyikan semua tab content
  document.querySelectorAll('.tab-content').forEach((el) => {
    el.classList.add('hidden');
  });

  // Tampilkan tab yang dipilih
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove('hidden');

  // Update styling navigasi
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active-tab');
    btn.classList.add('inactive-tab');
  });

  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('inactive-tab');
    activeBtn.classList.add('active-tab');
  }

  // Reload data spesifik saat tab dibuka
  if (tabId === 'tab-dashboard') loadDashboardData();
  if (tabId === 'tab-schedules') loadSchedules();
  if (tabId === 'tab-history') loadLogs();
  if (tabId === 'tab-settings') loadSettings();

  lucide.createIcons();
}

// ==========================================
// 3. TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600 border-emerald-500' :
                  type === 'error' ? 'bg-red-600 border-red-500' :
                  'bg-slate-800 border-slate-700';

  toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl border text-white text-xs font-medium shadow-xl transition-all transform duration-300 translate-y-2 opacity-0 ${bgColor}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// 4. DASHBOARD DATA
// ==========================================
async function loadDashboardData() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    document.getElementById('statActiveSchedules').innerText = data.activeSchedulesCount || 0;
    document.getElementById('statTotalCompleted').innerText = data.totalCompletedVideos || 0;

    // Load schedule list preview
    const schedRes = await fetch('/api/schedules');
    const schedules = await schedRes.json();

    const tbody = document.getElementById('dashboardScheduleList');
    if (!tbody) return;

    if (schedules.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-5 py-6 text-center text-slate-500 text-xs">
            Belum ada jadwal yang dibuat. Klik tombol "Buat Jadwal Baru" untuk memulai.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = schedules.slice(0, 5).map((s) => `
      <tr class="hover:bg-slate-800/30 transition">
        <td class="px-5 py-3 font-semibold text-white">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${s.enabled ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
            ${escapeHtml(s.title)}
          </div>
        </td>
        <td class="px-5 py-3 font-mono text-cyan-400 font-bold">
          ${s.timeType === 'daily' ? `Setiap Hari Jam ${s.timeValue}` : s.timeValue}
        </td>
        <td class="px-5 py-3 text-slate-300 max-w-xs truncate" title="${escapeHtml(s.topic)}">
          ${s.topic === 'auto' ? '<span class="text-amber-400 font-semibold">🔄 Otomatis dari Bank Topik</span>' : escapeHtml(s.topic)}
        </td>
        <td class="px-5 py-3">
          <div class="flex items-center gap-1.5">
            ${s.platforms?.includes('youtube') ? '<span class="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold">YT Shorts</span>' : ''}
            ${s.platforms?.includes('tiktok') ? '<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-400 font-bold">TikTok</span>' : ''}
          </div>
        </td>
        <td class="px-5 py-3">
          <button onclick="triggerRunSchedule('${s.id}')" class="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
            <i data-lucide="play" class="w-3 h-3"></i> Jalankan
          </button>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Error load dashboard:', err);
  }
}

// ==========================================
// 5. SCHEDULES MANAGEMENT
// ==========================================
async function loadSchedules() {
  try {
    const res = await fetch('/api/schedules');
    const schedules = await res.json();
    const container = document.getElementById('fullScheduleList');
    if (!container) return;

    if (schedules.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-surface-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          Belum ada jadwal tayang otomatis. Buat jadwal pertama Anda sekarang!
        </div>
      `;
      return;
    }

    container.innerHTML = schedules.map((s) => `
      <div class="bg-surface-900 border ${s.enabled ? 'border-slate-800' : 'border-slate-800/40 opacity-70'} rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
              <span class="w-1.5 h-1.5 rounded-full ${s.enabled ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
              ${s.enabled ? 'Jadwal Aktif' : 'Nonaktif'}
            </span>
            <div class="flex items-center gap-1">
              <button onclick="editSchedule('${s.id}')" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" title="Edit">
                <i data-lucide="pencil" class="w-4 h-4"></i>
              </button>
              <button onclick="deleteSchedule('${s.id}')" class="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition" title="Hapus">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <h3 class="text-base font-bold text-white">${escapeHtml(s.title)}</h3>

          <div class="space-y-1.5 text-xs text-slate-300">
            <div class="flex items-center gap-2">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span class="text-slate-400">Waktu:</span>
              <span class="font-mono font-bold text-cyan-400">${s.timeType === 'daily' ? `Setiap Hari Jam ${s.timeValue}` : s.timeValue}</span>
            </div>
            <div class="flex items-start gap-2">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-amber-400 mt-0.5"></i>
              <span class="text-slate-400">Topik:</span>
              <span class="font-medium text-slate-200 line-clamp-2">${s.topic === 'auto' ? '<span class="text-amber-400 font-semibold">🔄 Otomatis dari Bank Topik</span>' : escapeHtml(s.topic)}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            ${s.platforms?.includes('youtube') ? '<span class="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold">YouTube</span>' : ''}
            ${s.platforms?.includes('tiktok') ? '<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-400 font-bold">TikTok</span>' : ''}
          </div>

          <button onclick="triggerRunSchedule('${s.id}')" class="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition">
            <i data-lucide="play" class="w-3.5 h-3.5"></i> Run Now
          </button>
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Error load schedules:', err);
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function toggleTimeInput() {
  const type = document.getElementById('schTimeType').value;
  const dailyInput = document.getElementById('schTimeDaily');
  const datetimeInput = document.getElementById('schTimeDatetime');

  if (type === 'daily') {
    dailyInput.classList.remove('hidden');
    datetimeInput.classList.add('hidden');
  } else {
    dailyInput.classList.add('hidden');
    datetimeInput.classList.remove('hidden');
  }
}

async function handleSaveSchedule(e) {
  e.preventDefault();
  const id = document.getElementById('schId').value;
  const title = document.getElementById('schTitle').value;
  const timeType = document.getElementById('schTimeType').value;
  const timeValue = timeType === 'daily'
    ? document.getElementById('schTimeDaily').value
    : document.getElementById('schTimeDatetime').value;
  const topic = document.getElementById('schTopic').value || 'auto';

  const platforms = [];
  if (document.getElementById('schPlatformYt').checked) platforms.push('youtube');
  if (document.getElementById('schPlatformTt').checked) platforms.push('tiktok');

  if (!timeValue) {
    showToast('Harap tentukan waktu eksekusi.', 'error');
    return;
  }

  const payload = { title, timeType, timeValue, topic, platforms, enabled: true };

  try {
    const url = id ? `/api/schedules/${id}` : '/api/schedules';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(id ? 'Jadwal berhasil diperbarui!' : 'Jadwal baru berhasil dibuat!', 'success');
      closeModal('scheduleModal');
      document.getElementById('scheduleForm').reset();
      document.getElementById('schId').value = '';
      loadSchedules();
      loadDashboardData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Gagal menyimpan jadwal.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

async function deleteSchedule(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
  try {
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Jadwal berhasil dihapus.', 'success');
      loadSchedules();
      loadDashboardData();
    }
  } catch {
    showToast('Gagal menghapus jadwal.', 'error');
  }
}

async function triggerRunSchedule(id) {
  showToast('Memulai pipeline untuk jadwal yang dipilih...', 'info');
  try {
    const res = await fetch(`/api/schedules/${id}/run`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      switchTab('tab-history');
      if (data.jobId) {
        startHistoryAutoRefresh(data.jobId);
      } else {
        loadLogs();
      }
    } else {
      showToast(data.error || 'Gagal memicu jadwal.', 'error');
    }
  } catch {
    showToast('Terjadi kesalahan koneksi server.', 'error');
  }
}

// ==========================================
// 6. TOPIC BANK
// ==========================================
async function loadTopicBank() {
  try {
    const res = await fetch('/api/topics');
    const topics = await res.json();
    const textarea = document.getElementById('topicBankInput');
    if (textarea && Array.isArray(topics)) {
      textarea.value = topics.join('\n');
    }
  } catch (err) {
    console.error('Error load topic bank:', err);
  }
}

async function saveTopicBank() {
  const textarea = document.getElementById('topicBankInput');
  const topics = textarea.value.split('\n').map((t) => t.trim()).filter(Boolean);

  try {
    const res = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics })
    });
    if (res.ok) {
      showToast(`Berhasil menyimpan ${topics.length} topik ke dalam antrean!`, 'success');
    }
  } catch {
    showToast('Gagal menyimpan bank topik.', 'error');
  }
}

// ==========================================
// 7. INSTANT MANUAL GENERATOR (AI TOPIC DISCOVERY & GENERATE)
// ==========================================
async function clickLevelToFetchAiTopics(level) {
  const container = document.getElementById('aiLevelTopicsContainer');
  const loading = document.getElementById('aiTopicsLoading');
  const grid = document.getElementById('aiTopicsGrid');
  const headerLevel = document.getElementById('aiTopicsHeaderLevel');
  const loadingText = document.getElementById('aiTopicsLoadingText');

  if (container) container.classList.remove('hidden');
  if (loading) loading.classList.remove('hidden');
  if (grid) grid.classList.add('hidden');
  if (headerLevel) headerLevel.innerText = `Pilihan Topik AI Khusus Jenjang [${level}]`;
  if (loadingText) loadingText.innerText = `✨ AI Gemini sedang merangkai 4 ide materi matematika seru untuk tingkat [${level}]...`;

  lucide.createIcons();
  container?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const res = await fetch('/api/topics/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', level })
    });

    const data = await res.json();
    if (data.success && Array.isArray(data.topics) && data.topics.length > 0) {
      if (loading) loading.classList.add('hidden');
      if (grid) grid.classList.remove('hidden');

      grid.innerHTML = data.topics.map((t, idx) => {
        let levelColor = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
        if (level === 'SMP') levelColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
        if (level === 'SMA') levelColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
        if (level === 'KULIAH' || level === 'KULIAHAN') levelColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

        const safeTitle = escapeHtml(t.title);
        const escapedTitleParam = t.title.replace(/'/g, "\\'");

        return `
          <div onclick="selectAndInstantGenerateTopic('${escapedTitleParam}')" class="group bg-surface-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 rounded-xl p-4 flex flex-col justify-between space-y-3 cursor-pointer transition shadow-sm hover:shadow-lg hover:shadow-amber-500/10">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${levelColor}">
                  ${escapeHtml(t.level || level)}
                </span>
                <span class="text-[11px] text-slate-400 font-semibold">${escapeHtml(t.tag || 'Materi')}</span>
              </div>
              <h5 class="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
                ${safeTitle}
              </h5>
              <p class="text-[11px] text-slate-400 line-clamp-2">
                ${escapeHtml(t.description || '')}
              </p>
            </div>
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span class="text-[10px] text-slate-500">Durasi: 1 Menit</span>
              <button type="button" class="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-amber-600 group-hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                <span>Pilih & Generate</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      lucide.createIcons();
    } else {
      showToast('Gagal memuat topik dari AI. Coba lagi.', 'error');
    }
  } catch (err) {
    console.error('Error fetching AI topics:', err);
    showToast('Terjadi kesalahan saat memuat topik AI.', 'error');
  }
}

function selectAndInstantGenerateTopic(title) {
  const input = document.getElementById('genTopic');
  if (input) input.value = title;

  closeAiLevelTopics();
  showToast(`⚡ Memilih topik: "${title}" dan langsung memproses video...`, 'info');

  const form = document.getElementById('instantGenerateForm');
  if (form) {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
}

function closeAiLevelTopics() {
  const container = document.getElementById('aiLevelTopicsContainer');
  if (container) container.classList.add('hidden');
}

function generateByLevel(level) {
  clickLevelToFetchAiTopics(level);
}

function generateDirectWithAi(topicPrompt) {
  const input = document.getElementById('genTopic');
  if (input) {
    input.value = topicPrompt;
  }
  showToast(`⚡ Langsung meminta AI Gemini untuk: "${topicPrompt}"...`, 'info');
  const form = document.getElementById('instantGenerateForm');
  if (form) {
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
}

function generateRandomDirectWithAi() {
  const randomTopics = [
    'Trik Ajaib Hitung Kuadrat Akhiran 5 dalam 2 Detik [SD]',
    'Rahasia Perkalian Kilat Angka 11 [SD]',
    'Misteri Angka Ajaib Kaprekar 6174 yang Selalu Berulang [SMP]',
    'Segitiga Pascal dan Pola Tersembunyi Alam Semesta [SMP]',
    'Trik 5 Jari Menghafal Sudut Istimewa Trigonometri [SMA]',
    'Paradoks Monty Hall: Kenapa Mengganti Pintu Melipatgandakan Peluang [SMA]',
    'Keindahan Rumus Identitas Euler e^(iπ) + 1 = 0 [KULIAHAN]',
    'Kenapa 0 Faktorial Sama dengan 1? Pembuktian Visual Sederhana [KULIAHAN]'
  ];
  const chosen = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  generateDirectWithAi(chosen);
}

function fillRandomTopic() {
  generateRandomDirectWithAi();
}

function setMathTopic(topic) {
  generateDirectWithAi(topic);
}

// Fallbacks for compatibility
function selectAiTopic(topic) {
  generateDirectWithAi(topic);
}

function selectAndGenerateAiTopic(topic) {
  generateDirectWithAi(topic);
}

function closeAiSuggestions() {
  const box = document.getElementById('aiTopicSuggestions');
  if (box) box.classList.add('hidden');
}

async function generateAiTopicsToBank() {
  try {
    showToast('AI sedang mencari 5 topik matematika baru...', 'info');
    const res = await fetch('/api/topics/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', level: 'SEMUA' })
    });

    const data = await res.json();
    if (data.success && Array.isArray(data.topics)) {
      const textarea = document.getElementById('topicBankInput');
      const current = textarea.value.trim();
      const newTitles = data.topics.map(t => t.title);
      textarea.value = current ? `${current}\n${newTitles.join('\n')}` : newTitles.join('\n');
      
      await saveTopicBank();
      showToast(`Berhasil menambahkan ${newTitles.length} topik baru dari AI ke Bank Antrean!`, 'success');
    }
  } catch (err) {
    console.error('Error generate AI topics to bank:', err);
    showToast('Gagal menambahkan topik AI ke antrean.', 'error');
  }
}

// ==========================================
// VIDEO PREVIEW MODAL
// ==========================================
function playVideoModal(videoUrl, title) {
  const modal = document.getElementById('videoPreviewModal');
  const player = document.getElementById('modalVideoPlayer');
  const titleEl = document.getElementById('modalVideoTitle');
  const downloadBtn = document.getElementById('modalDownloadBtn');

  if (titleEl) titleEl.innerText = title || 'Putar Video';
  if (downloadBtn) downloadBtn.href = videoUrl;

  if (player) {
    player.src = videoUrl + '?t=' + Date.now();
    player.load();
    player.play().catch(() => {});
  }

  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeVideoModal() {
  const modal = document.getElementById('videoPreviewModal');
  const player = document.getElementById('modalVideoPlayer');
  if (player) {
    player.pause();
    player.src = '';
  }
  if (modal) modal.classList.add('hidden');
}

async function handleInstantGenerate(e) {
  e.preventDefault();
  const topic = document.getElementById('genTopic').value.trim();
  const yt = document.getElementById('genPlatformYt').checked;
  const tt = document.getElementById('genPlatformTt').checked;

  const platforms = [];
  if (yt) platforms.push('youtube');
  if (tt) platforms.push('tiktok');

  if (platforms.length === 0) {
    showToast('Pilih minimal satu platform upload.', 'error');
    return;
  }

  // Tampilkan panel progress
  const progressContainer = document.getElementById('liveProgressContainer');
  progressContainer.classList.remove('hidden');
  document.getElementById('liveOutputResult')?.classList.add('hidden');
  document.getElementById('scriptApprovalContainer')?.classList.add('hidden');
  document.getElementById('uploadApprovalContainer')?.classList.add('hidden');
  progressContainer.scrollIntoView({ behavior: 'smooth' });

  updateProgressVisual(10, 'Mengirim perintah pipeline ke server...', 'step-ai');

  try {
    const res = await fetch('/api/generate-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, platforms })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Gagal memulai pipeline.', 'error');
      return;
    }

    showToast('Pipeline video dimulai! Memantau status rendering...', 'info');

    if (data.jobId) {
      trackJobProgress(data.jobId);
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

function updateProgressVisual(percent, message, activeStepId) {
  const percentEl = document.getElementById('liveProgressPercent');
  const barEl = document.getElementById('liveProgressBar');
  const msgEl = document.getElementById('liveProgressMessage');

  if (percentEl) percentEl.innerText = `${percent}%`;
  if (barEl) barEl.style.width = `${percent}%`;
  if (msgEl) msgEl.innerText = message;

  ['step-ai', 'step-render', 'step-upload'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === activeStepId) {
      el.className = 'bg-cyan-500/10 border border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 text-cyan-400';
    } else {
      el.className = 'bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3 text-slate-400';
    }
  });
}

let currentActiveJobId = null;

function trackJobProgress(jobId) {
  currentActiveJobId = jobId;
  if (activePollingInterval) clearInterval(activePollingInterval);

  activePollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) {
        // Jika job di memori selesai, periksa logs
        const logsRes = await fetch(`/api/logs?t=${Date.now()}`, { cache: 'no-store' });
        const logs = await logsRes.json();
        const found = logs.find((l) => l.id === jobId);
        if (found) {
          clearInterval(activePollingInterval);
          displayCompletedJob(found);
        }
        return;
      }

      const job = await res.json();

      if (job.step === 'AI_GENERATION') {
        updateProgressVisual(job.progress || 15, job.message || 'AI sedang merangkai naskah...', 'step-ai');
        hideApprovalContainers();
      } else if (job.step === 'AWAITING_RENDER_APPROVAL') {
        // Checkpoint 1: Naskah AI selesai dibuat, menunggu persetujuan
        updateProgressVisual(job.progress || 25, job.message, 'step-ai');
        displayScriptApproval(job);
      } else if (job.step === 'VOICE_SYNTHESIS') {
        updateProgressVisual(job.progress || 30, job.message, 'step-render');
        hideScriptApproval();
      } else if (job.step === 'RENDERING') {
        updateProgressVisual(job.progress || 50, job.message, 'step-render');
        hideScriptApproval();
      } else if (job.step === 'AWAITING_UPLOAD_APPROVAL') {
        // Checkpoint 2: Video selesai dirender, menunggu persetujuan upload
        updateProgressVisual(job.progress || 85, job.message, 'step-upload');
        displayUploadApproval(job);
      } else if (job.step === 'UPLOADING') {
        updateProgressVisual(job.progress || 90, job.message, 'step-upload');
      } else if (job.step === 'COMPLETED') {
        clearInterval(activePollingInterval);
        hideApprovalContainers();
        displayCompletedJob(job);
      } else if (job.step === 'CANCELLED') {
        clearInterval(activePollingInterval);
        hideApprovalContainers();
        updateProgressVisual(0, 'Pembuatan video dibatalkan oleh pengguna.', null);
        showToast('Proses video telah dibatalkan.', 'info');
        loadLogs();
      } else if (job.step === 'FAILED') {
        clearInterval(activePollingInterval);
        hideApprovalContainers();
        updateProgressVisual(100, `Gagal: ${job.error || 'Terjadi kesalahan eksekusi'}`, null);
        showToast(job.error || 'Pembuatan video gagal.', 'error');
        loadLogs();
      }
    } catch (err) {
      console.warn('Polling error:', err);
    }
  }, 1200);
}

function displayScriptApproval(job) {
  const container = document.getElementById('scriptApprovalContainer');
  if (!container) return;

  container.classList.remove('hidden');
  document.getElementById('uploadApprovalContainer')?.classList.add('hidden');
  document.getElementById('liveOutputResult')?.classList.add('hidden');

  const content = job.generatedContent || {};

  // Badge level & maskot
  const levelEl = document.getElementById('scriptLevelBadge');
  if (levelEl) levelEl.innerText = content.level || '🎒 LEVEL MATEMATIKA';

  const mascotEl = document.getElementById('scriptMascotBadge');
  if (mascotEl) mascotEl.innerText = `Maskot: ${content.mascot || '🦉'}`;

  const themeEl = document.getElementById('scriptThemeBadge');
  if (themeEl) themeEl.innerText = `Tema: ${content.theme || 'kids-arcade'}`;

  // Judul & Deskripsi
  const ytEl = document.getElementById('scriptYtTitle');
  if (ytEl) ytEl.innerText = content.youtubeTitle || job.topic;

  const ttEl = document.getElementById('scriptTtTitle');
  if (ttEl) ttEl.innerText = content.tiktokTitle || job.topic;

  const descEl = document.getElementById('scriptDescription');
  if (descEl) descEl.innerText = content.description || 'Tidak ada deskripsi.';

  // 5 Scenes Cards
  const scenesList = document.getElementById('scriptScenesList');
  if (scenesList && Array.isArray(content.scenes)) {
    scenesList.innerHTML = content.scenes.map((s, idx) => {
      let layoutColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      if (s.layout === 'kids-challenge') layoutColor = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      if (s.layout === 'battle-vs') layoutColor = 'bg-red-500/15 text-red-400 border-red-500/30';
      if (s.layout === 'geometry') layoutColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      if (s.layout === 'practice-round') layoutColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      if (s.layout === 'celebration-star') layoutColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

      return `
        <div class="bg-surface-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-500 font-mono">SCENE ${idx + 1} (12s)</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold border ${layoutColor}">${escapeHtml(s.tag || s.layout)}</span>
            </div>
            <div class="text-xs font-bold text-white line-clamp-2">${escapeHtml(s.title || '')}</div>
            ${s.stat ? `<div class="p-1.5 bg-slate-950 rounded text-[11px] font-mono text-amber-300 font-bold border border-slate-800">${escapeHtml(s.stat)}</div>` : ''}
            ${s.oldMethod ? `<div class="text-[10px] text-red-400 line-clamp-2">😫 ${escapeHtml(s.oldMethod)}</div>` : ''}
            ${s.fastMethod ? `<div class="text-[10px] text-emerald-400 line-clamp-2">🤩 ${escapeHtml(s.fastMethod)}</div>` : ''}
            <div class="text-[11px] text-slate-300 leading-relaxed">${escapeHtml(s.body || '')}</div>
          </div>
          <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Layout: <b>${escapeHtml(s.layout)}</b></span>
            <span>${s.icon || '✨'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Reset tombol render
  const btnRender = document.getElementById('btnApproveRender');
  if (btnRender) {
    btnRender.disabled = false;
    btnRender.innerHTML = `<i data-lucide="play-circle" class="w-5 h-5"></i><span>🎬 Ya, Lanjut Jadikan Video (Render Sekarang)</span>`;
  }

  lucide.createIcons();
}

function hideScriptApproval() {
  const container = document.getElementById('scriptApprovalContainer');
  if (container) container.classList.add('hidden');
}

function hideApprovalContainers() {
  hideScriptApproval();
  const upContainer = document.getElementById('uploadApprovalContainer');
  if (upContainer) upContainer.classList.add('hidden');
}

async function approveCurrentJobRender() {
  if (!currentActiveJobId) return;
  const btn = document.getElementById('btnApproveRender');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div><span>Menyiapkan Render GPU...</span>`;
  }

  try {
    const res = await fetch(`/api/jobs/${currentActiveJobId}/approve-render`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Naskah disetujui! Memulai pembuatan suara narasi & render video GPU...', 'success');
      hideScriptApproval();
      updateProgressVisual(30, 'Menghasilkan suara narasi pengarah (TTS Bahasa Indonesia)...', 'step-render');
    } else {
      showToast(data.error || 'Gagal memulai render.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="play-circle" class="w-5 h-5"></i><span>🎬 Ya, Lanjut Jadikan Video (Render Sekarang)</span>`;
        lucide.createIcons();
      }
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

async function cancelCurrentJob() {
  if (!currentActiveJobId) return;
  if (!confirm('Apakah Anda yakin ingin membatalkan naskah ini?')) return;

  try {
    const res = await fetch(`/api/jobs/${currentActiveJobId}/cancel`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Naskah dan proses video dibatalkan.', 'info');
      hideApprovalContainers();
      updateProgressVisual(0, 'Pembuatan video dibatalkan oleh pengguna.', null);
      if (activePollingInterval) clearInterval(activePollingInterval);
      loadLogs();
    } else {
      showToast(data.error || 'Gagal membatalkan job.', 'error');
    }
  } catch {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

function displayUploadApproval(job) {
  const container = document.getElementById('uploadApprovalContainer');
  if (!container) return;

  container.classList.remove('hidden');
  document.getElementById('scriptApprovalContainer')?.classList.add('hidden');
  document.getElementById('liveOutputResult')?.classList.add('hidden');

  // Video player
  if (job.videoPublicUrl) {
    const player = document.getElementById('approvalVideoPlayer');
    const dlBtn = document.getElementById('approvalDownloadBtn');
    if (player) {
      player.src = job.videoPublicUrl + '?t=' + Date.now();
      player.load();
    }
    if (dlBtn) dlBtn.href = job.videoPublicUrl;
  }

  const titlePreview = document.getElementById('approvalUploadTitlePreview');
  if (titlePreview) {
    titlePreview.innerText = job.generatedContent?.youtubeTitle || job.topic;
  }

  // Reset tombol upload
  const btnUpload = document.getElementById('btnApproveUpload');
  if (btnUpload) {
    btnUpload.disabled = false;
    btnUpload.innerHTML = `<i data-lucide="upload-cloud" class="w-5 h-5"></i><span>🚀 Ya, Lanjut Upload Sekarang</span>`;
  }

  lucide.createIcons();
}

async function approveCurrentJobUpload() {
  if (!currentActiveJobId) return;
  const yt = document.getElementById('approvePlatformYt')?.checked;
  const tt = document.getElementById('approvePlatformTt')?.checked;

  const platforms = [];
  if (yt) platforms.push('youtube');
  if (tt) platforms.push('tiktok');

  if (platforms.length === 0) {
    showToast('Pilih minimal satu platform untuk diunggah.', 'error');
    return;
  }

  const btn = document.getElementById('btnApproveUpload');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div><span>Mengunggah ke Platform...</span>`;
  }

  try {
    const res = await fetch(`/api/jobs/${currentActiveJobId}/approve-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Persetujuan upload diterima! Mengunggah ke platform...', 'info');
      updateProgressVisual(90, 'Mengunggah video ke YouTube Shorts & TikTok...', 'step-upload');
    } else {
      showToast(data.error || 'Gagal menyetujui upload.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="upload-cloud" class="w-5 h-5"></i><span>🚀 Ya, Lanjut Upload Sekarang</span>`;
        lucide.createIcons();
      }
    }
  } catch {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

async function skipCurrentJobUpload() {
  if (!currentActiveJobId) return;
  try {
    const res = await fetch(`/api/jobs/${currentActiveJobId}/skip-upload`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Video berhasil disimpan di server (tanpa upload)!', 'success');
      document.getElementById('uploadApprovalContainer')?.classList.add('hidden');
      if (activePollingInterval) clearInterval(activePollingInterval);

      // Tampilkan hasil selesai
      const jobRes = await fetch(`/api/jobs/${currentActiveJobId}?t=${Date.now()}`);
      if (jobRes.ok) {
        const job = await jobRes.json();
        displayCompletedJob(job);
      }
    } else {
      showToast(data.error || 'Gagal menyimpan.', 'error');
    }
  } catch {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

function displayCompletedJob(job) {
  updateProgressVisual(100, 'Selesai! Video berhasil dibuat dan siap diputar.', null);

  const outputResult = document.getElementById('liveOutputResult');
  if (outputResult) outputResult.classList.remove('hidden');

  // Video Player Langsung Putar
  if (job.videoPublicUrl) {
    const player = document.getElementById('liveVideoPlayer');
    if (player) {
      player.src = job.videoPublicUrl + '?t=' + Date.now();
      player.load();
      player.play().catch(() => {});
    }
  }

  // Details
  const detailsContainer = document.getElementById('liveDetailsContainer');
  if (detailsContainer) {
    detailsContainer.innerHTML = `
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
        <div class="text-slate-400 text-[10px] uppercase font-bold">Judul YouTube:</div>
        <div class="text-white font-semibold">${escapeHtml(job.generatedContent?.youtubeTitle || job.topic)}</div>
      </div>
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
        <div class="text-slate-400 text-[10px] uppercase font-bold">Caption TikTok:</div>
        <div class="text-cyan-300">${escapeHtml(job.generatedContent?.tiktokTitle || job.topic)}</div>
      </div>
      <div class="flex flex-wrap items-center gap-3 pt-2">
        ${job.videoPublicUrl ? `
          <button onclick="playVideoModal('${job.videoPublicUrl}', '${escapeHtml(job.topic)}')" class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition">
            <i data-lucide="play" class="w-4 h-4"></i> Putar Video Layar Penuh
          </button>
          <a href="${job.videoPublicUrl}" target="_blank" download class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition">
            <i data-lucide="download" class="w-4 h-4"></i> Download File MP4
          </a>
        ` : ''}
        ${job.youtubeResult?.videoUrl ? `
          <a href="${job.youtubeResult.videoUrl}" target="_blank" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition">
            <i data-lucide="youtube" class="w-4 h-4"></i> Buka YouTube Shorts
          </a>
        ` : ''}
        ${job.tiktokResult?.videoUrl ? `
          <a href="${job.tiktokResult.videoUrl}" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition">
            <i data-lucide="music-2" class="w-4 h-4"></i> Buka TikTok
          </a>
        ` : ''}
      </div>
    `;
    lucide.createIcons();
  }

  showToast('Video berhasil dibuat dan siap ditonton!', 'success');
  loadLogs();
  loadDashboardData();
}

let historyRefreshInterval = null;
function startHistoryAutoRefresh(jobId) {
  if (historyRefreshInterval) clearInterval(historyRefreshInterval);
  loadLogs();

  historyRefreshInterval = setInterval(async () => {
    const activeJobs = await checkActiveJobs();
    if (!activeJobs || activeJobs.length === 0) {
      clearInterval(historyRefreshInterval);
      loadLogs();
      loadDashboardData();
    } else {
      loadLogs(false);
    }
  }, 2000);
}

async function checkActiveJobs() {
  try {
    const res = await fetch(`/api/active-jobs?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ==========================================
// 8. LOGS & HISTORY
// ==========================================
async function loadLogs(showToastNotification = false) {
  try {
    const [logsRes, activeJobsRes] = await Promise.all([
      fetch(`/api/logs?t=${Date.now()}`, { cache: 'no-store' }),
      fetch(`/api/active-jobs?t=${Date.now()}`, { cache: 'no-store' }).catch(() => ({ json: () => [] }))
    ]);

    const logs = await logsRes.json();
    let activeJobs = [];
    try {
      activeJobs = await activeJobsRes.json();
    } catch {}

    // Render Active Jobs Banner jika ada yang sedang berjalan
    const activeJobsContainer = document.getElementById('activeJobsContainer');
    if (activeJobsContainer) {
      if (activeJobs && activeJobs.length > 0) {
        activeJobsContainer.innerHTML = activeJobs.map((j) => `
          <div class="p-4 bg-cyan-950/60 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div class="flex items-center gap-3">
              <div class="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping"></div>
              <div>
                <div class="text-xs font-bold text-white flex items-center gap-2">
                  <span class="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px]">SEDANG BERJALAN</span>
                  <span>${escapeHtml(j.topic)}</span>
                </div>
                <div class="text-[11px] text-cyan-300/80 font-mono mt-0.5">${escapeHtml(j.message || 'Sedang merender frame Remotion...')}</div>
              </div>
            </div>
            <div class="flex items-center gap-3 self-end sm:self-auto">
              <span class="text-xs font-mono font-bold text-cyan-400">${j.progress || 10}%</span>
              <div class="w-28 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div class="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300" style="width: ${j.progress || 10}%"></div>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        activeJobsContainer.innerHTML = '';
      }
    }

    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-5 py-8 text-center text-slate-500">
            Belum ada log aktivitas video yang tersimpan.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map((l) => `
      <tr class="hover:bg-slate-800/30 transition">
        <td class="px-5 py-3 text-slate-400">
          ${new Date(l.completedAt || l.startedAt).toLocaleString('id-ID')}
        </td>
        <td class="px-5 py-3 font-sans font-semibold text-white max-w-xs truncate" title="${escapeHtml(l.topic)}">
          ${escapeHtml(l.topic)}
        </td>
        <td class="px-5 py-3">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${l.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
            ${l.status === 'success' ? 'SUKSES' : 'GAGAL'}
          </span>
        </td>
        <td class="px-5 py-3">
          ${l.youtubeResult?.videoUrl ? `
            <a href="${l.youtubeResult.videoUrl}" target="_blank" class="text-red-400 hover:underline flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> YouTube
            </a>
          ` : '<span class="text-slate-600">-</span>'}
        </td>
        <td class="px-5 py-3">
          ${l.tiktokResult?.videoUrl ? `
            <a href="${l.tiktokResult.videoUrl}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> TikTok
            </a>
          ` : '<span class="text-slate-600">-</span>'}
        </td>
        <td class="px-5 py-3">
          ${l.videoPublicUrl ? `
            <div class="flex items-center gap-2">
              <button type="button" onclick="playVideoModal('${l.videoPublicUrl}', '${escapeHtml(l.topic)}')" class="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                <i data-lucide="play" class="w-3 h-3"></i> Putar Video
              </button>
              <a href="${l.videoPublicUrl}" target="_blank" download class="text-slate-400 hover:text-white underline text-xs">
                Download
              </a>
            </div>
          ` : '<span class="text-slate-600">-</span>'}
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
    if (showToastNotification) {
      showToast('Riwayat video berhasil diperbarui!', 'success');
    }
  } catch (err) {
    console.error('Error load logs:', err);
  }
}

// ==========================================
// 9. SETTINGS & YOUTUBE OAUTH
// ==========================================
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();

    document.getElementById('cfgGeminiKey').value = settings.geminiApiKey || '';

    // YouTube
    const yt = settings.youtube || {};
    document.getElementById('cfgYtEnabled').checked = yt.enabled !== false;
    document.getElementById('cfgYtClientId').value = yt.clientId || '';
    document.getElementById('cfgYtClientSecret').value = yt.clientSecret || '';
    document.getElementById('cfgYtRefreshToken').value = yt.refreshToken || '';
    document.getElementById('cfgYtPrivacy').value = yt.defaultPrivacy || 'public';

    // TikTok
    const tt = settings.tiktok || {};
    document.getElementById('cfgTtEnabled').checked = tt.enabled !== false;
    document.getElementById('cfgTtKey').value = tt.clientKey || '';
    document.getElementById('cfgTtSecret').value = tt.clientSecret || '';
    document.getElementById('cfgTtAccessToken').value = tt.accessToken || '';
    document.getElementById('cfgTtPrivacy').value = tt.defaultPrivacy || 'PUBLIC_TO_EVERYONE';
  } catch (err) {
    console.error('Error load settings:', err);
  }
}

async function saveSettings(e) {
  e.preventDefault();

  const payload = {
    geminiApiKey: document.getElementById('cfgGeminiKey').value.trim(),
    youtube: {
      enabled: document.getElementById('cfgYtEnabled').checked,
      clientId: document.getElementById('cfgYtClientId').value.trim(),
      clientSecret: document.getElementById('cfgYtClientSecret').value.trim(),
      refreshToken: document.getElementById('cfgYtRefreshToken').value.trim(),
      defaultPrivacy: document.getElementById('cfgYtPrivacy').value
    },
    tiktok: {
      enabled: document.getElementById('cfgTtEnabled').checked,
      clientKey: document.getElementById('cfgTtKey').value.trim(),
      clientSecret: document.getElementById('cfgTtSecret').value.trim(),
      accessToken: document.getElementById('cfgTtAccessToken').value.trim(),
      defaultPrivacy: document.getElementById('cfgTtPrivacy').value
    }
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Pengaturan API & Kredensial berhasil disimpan!', 'success');
    } else {
      showToast('Gagal menyimpan pengaturan.', 'error');
    }
  } catch {
    showToast('Terjadi kesalahan jaringan.', 'error');
  }
}

async function connectYouTubeAuth() {
  try {
    const res = await fetch('/api/youtube/auth-url');
    const data = await res.json();
    if (res.ok && data.authUrl) {
      window.location.href = data.authUrl;
    } else {
      showToast(data.error || 'Harap isi Client ID & Secret terlebih dahulu.', 'error');
    }
  } catch {
    showToast('Gagal menghubungkan YouTube OAuth2.', 'error');
  }
}

// Utility Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
