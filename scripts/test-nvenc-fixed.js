const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

async function testNvencFixed() {
  console.log('Testing Remotion rendering with fixed NVIDIA NVENC options...');
  const entryPoint = path.join(__dirname, '..', 'remotion', 'index.js');
  
  const bundleLocation = await bundle({ entryPoint });
  const composition = await selectComposition({ serveUrl: bundleLocation, id: 'ShortVideo' });
  const outputPath = path.join(__dirname, '..', 'out', 'test_nvenc_success.mp4');

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    frameRange: [0, 30], // 1 detik (30 frame)
    chromiumOptions: {
      gl: 'angle' // ANGLE GPU acceleration
    },
    ffmpegOverride: ({ type, args }) => {
      console.log(`[FFmpeg Override Hook] Type: ${type}`);
      const newArgs = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === 'libx264') {
          newArgs.push('h264_nvenc');
        } else if (args[i] === '-crf') {
          // Ganti -crf dengan -cq untuk NVIDIA NVENC
          newArgs.push('-cq');
          newArgs.push(String(args[i + 1]));
          i++; // Lewati nilai crf
        } else {
          newArgs.push(args[i]);
        }
      }
      console.log('[FFmpeg Override] Converted args for NVENC:', newArgs);
      return newArgs;
    },
    onProgress: ({ progress }) => {
      console.log(`Progress: ${Math.floor(progress * 100)}%`);
    }
  });

  console.log('🎉 RENDER DENGAN NVIDIA GPU NVENC BERHASIL 100%!');
  console.log('File:', outputPath, 'Ukuran:', fs.statSync(outputPath).size, 'bytes');
}

testNvencFixed().catch(err => {
  console.error('Error testing fixed NVENC:', err);
});
