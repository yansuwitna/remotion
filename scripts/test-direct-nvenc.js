const { execSync } = require('child_process');
const path = require('path');

const ffmpegPath = path.join(__dirname, '..', 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');

try {
  // Test 1 second color bar to nvenc
  const cmd = `"${ffmpegPath}" -y -f lavfi -i testsrc=duration=1:size=1080x1920:rate=30 -c:v h264_nvenc "${path.join(__dirname, '..', 'out', 'test_direct_nvenc.mp4')}"`;
  console.log('Running:', cmd);
  const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  console.log('Direct NVENC Success!', out);
} catch (e) {
  console.log('Direct NVENC Failed:');
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
