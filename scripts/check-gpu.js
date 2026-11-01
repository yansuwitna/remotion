const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkGPU() {
  console.log('=== DETEKSI GPU / VIDEO CARD SYSTEM ===');
  
  // 1. Cek Windows CIM VideoController
  try {
    const wmicOutput = execSync('powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion, Status | ConvertTo-Json"', { encoding: 'utf8' });
    const gpus = JSON.parse(wmicOutput);
    console.log('Detected Video Cards:', Array.isArray(gpus) ? gpus : [gpus]);
  } catch (e) {
    console.log('Error checking Win32_VideoController:', e.message);
  }

  // 2. Cek NVIDIA SMI
  let hasNvidia = false;
  try {
    const smi = execSync('nvidia-smi --query-gpu=name,driver_version,memory.total,memory.free --format=csv,noheader', { encoding: 'utf8' });
    console.log('\nNVIDIA GPU Terdeteksi:\n' + smi.trim());
    hasNvidia = true;
  } catch {
    console.log('\nNVIDIA SMI tidak terdeteksi.');
  }

  // 3. Cek Encoders di Remotion FFmpeg
  const ffmpegPath = path.join(__dirname, '..', 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
  if (fs.existsSync(ffmpegPath)) {
    try {
      const encoders = execSync(`"${ffmpegPath}" -encoders`, { encoding: 'utf8' });
      const hwEncoders = encoders.split('\n').filter(line => 
        line.includes('nvenc') || line.includes('qsv') || line.includes('amf') || line.includes('264')
      );
      console.log('\nHardware / H.264 Encoders pada Remotion FFmpeg:');
      console.log(hwEncoders.join('\n'));
    } catch (e) {
      console.log('Error checking ffmpeg encoders:', e.message);
    }
  }

  // 4. Cek Chromium GPU Information dari Remotion
  try {
    const { getChromiumGpuInformation } = require('@remotion/renderer');
    console.log('\nFungsi getChromiumGpuInformation tersedia di @remotion/renderer.');
  } catch (e) {
    console.log('Notice renderer:', e.message);
  }
}

checkGPU();
