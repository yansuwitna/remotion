const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

async function testNvenc() {
  console.log('Testing Remotion rendering with NVIDIA NVENC hardware acceleration...');
  const entryPoint = path.join(__dirname, '..', 'remotion', 'index.js');
  
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'ShortVideo'
  });

  const outputPath = path.join(__dirname, '..', 'out', 'test_nvenc.mp4');

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    frameRange: [0, 60], // Test 2 detik (60 frame)
    chromiumOptions: {
      gl: 'angle' // Gunakan ANGLE Hardware GPU
    },
    ffmpegOverride: ({ type, args }) => {
      console.log(`[FFmpeg Override Hook] Type: ${type}`);
      // Ganti libx264 dengan h264_nvenc untuk menggunakan GPU NVIDIA
      const newArgs = args.map((arg, idx) => {
        if (arg === 'libx264') return 'h264_nvenc';
        return arg;
      });
      console.log('[FFmpeg Override] Converted video encoder to h264_nvenc');
      return newArgs;
    },
    onProgress: ({ progress }) => {
      console.log(`Progress: Math.floor(${progress * 100})%`);
    }
  });

  console.log('Render dengan GPU NVIDIA NVENC BERHASIL:', outputPath, 'Size:', fs.statSync(outputPath).size);
}

testNvenc().catch(err => {
  console.error('Error testing NVENC:', err);
});
