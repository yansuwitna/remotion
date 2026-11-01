const { execSync } = require('child_process');

/**
 * Service Deteksi GPU & Akselerasi Video Card Eksternal / Dedicated (NVIDIA, AMD, Intel)
 */
class GpuDetectorService {
  constructor() {
    this.cachedInfo = null;
    this.lastCheck = 0;
  }

  /**
   * Dapatkan informasi lengkap video card pada sistem
   */
  getGpuInfo() {
    const now = Date.now();
    // Cache 30 detik agar tidak membebani proses
    if (this.cachedInfo && (now - this.lastCheck < 30000)) {
      return this.cachedInfo;
    }

    const isWindows = process.platform === 'win32';
    const result = {
      hasDedicatedGpu: false,
      activeGpuName: 'CPU / Integrated Graphics',
      vram: 'N/A',
      driverVersion: 'N/A',
      gpus: [],
      renderConfig: {
        gl: isWindows ? 'angle' : 'swangle', // ANGLE untuk Windows DirectX, Swangle untuk Linux CPU/VPS
        useNvenc: false,
        concurrency: 4
      },
      notice: ''
    };

    try {
      // 1. Deteksi lewat Win32_VideoController (Hanya pada OS Windows)
      if (isWindows) {
        const psCmd = 'powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion, Status | ConvertTo-Json"';
        const output = execSync(psCmd, { encoding: 'utf8', timeout: 5000 });
        let parsed = JSON.parse(output.trim());
        if (!Array.isArray(parsed)) parsed = [parsed];

        for (const item of parsed) {
          if (!item || !item.Name) continue;
          const name = item.Name;
          const ramMb = item.AdapterRAM ? Math.round(item.AdapterRAM / (1024 * 1024)) : 0;
          const ramGb = (ramMb / 1024).toFixed(1);
          const isNvidia = name.toLowerCase().includes('nvidia') || name.toLowerCase().includes('geforce') || name.toLowerCase().includes('quadro') || name.toLowerCase().includes('rtx') || name.toLowerCase().includes('gtx');
          const isAmd = name.toLowerCase().includes('radeon') || name.toLowerCase().includes('amd');
          const isDedicated = isNvidia || isAmd || ramMb >= 2048;

          result.gpus.push({
            name,
            ramMb,
            ramGb: `${ramGb} GB`,
            driverVersion: item.DriverVersion || 'N/A',
            isDedicated,
            vendor: isNvidia ? 'NVIDIA' : (isAmd ? 'AMD' : 'Intel')
          });

          if (isDedicated && !result.hasDedicatedGpu) {
            result.hasDedicatedGpu = true;
            result.activeGpuName = name;
            result.vram = `${ramGb} GB (${ramMb} MB)`;
            result.driverVersion = item.DriverVersion || 'N/A';
          }
        }
      }
    } catch (err) {
      console.warn('[GPU Detector] Gagal membaca controller grafis:', err.message);
    }

    // 2. Deteksi Khusus NVIDIA via nvidia-smi
    let nvidiaDriverVersion = null;
    try {
      const smi = execSync('nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader', { encoding: 'utf8', timeout: 3000 });
      const parts = smi.trim().split(',').map(s => s.trim());
      if (parts.length >= 2) {
        result.hasDedicatedGpu = true;
        result.activeGpuName = parts[0] || result.activeGpuName;
        nvidiaDriverVersion = parseFloat(parts[1]);
        result.driverVersion = parts[1];
        if (parts[2]) result.vram = parts[2];
      }
    } catch {
      // nvidia-smi tidak tersedia
    }

    // 3. Konfigurasi Optimal untuk Remotion Rendering
    if (result.hasDedicatedGpu) {
      result.renderConfig.gl = isWindows ? 'angle' : 'egl'; // ANGLE untuk Windows D3D11, EGL untuk Linux NVIDIA
      
      // Remotion FFmpeg v7.1 memerlukan driver NVIDIA minimal 551.76 untuk h264_nvenc
      if (nvidiaDriverVersion && nvidiaDriverVersion >= 551.76) {
        result.renderConfig.useNvenc = true;
        result.renderConfig.concurrency = 6;
        result.notice = `Video Card Dedicated "${result.activeGpuName}" aktif! Hardware rendering (${result.renderConfig.gl}) dan encoder h264_nvenc siap digunakan.`;
      } else {
        result.renderConfig.useNvenc = false;
        result.renderConfig.concurrency = 4;
        result.notice = `Video Card Dedicated "${result.activeGpuName}" aktif! Akselerasi GPU Chromium (${result.renderConfig.gl}) digunakan untuk render frame video. (Driver: ${result.driverVersion}).`;
      }
    } else {
      result.renderConfig.gl = isWindows ? 'angle' : 'swangle';
      result.renderConfig.concurrency = 2;
      result.notice = isWindows
        ? 'Video card dedicated tidak terdeteksi. Render menggunakan akselerasi standar ANGLE.'
        : 'VPS/Server CPU rendering terdeteksi. Render menggunakan software rasterizer Swangle.';
    }

    this.cachedInfo = result;
    this.lastCheck = now;
    return result;
  }
}

module.exports = new GpuDetectorService();
