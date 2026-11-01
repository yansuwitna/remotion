const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

async function testAngleGpu() {
  console.log('Testing Remotion rendering with Chromium ANGLE GPU hardware acceleration...');
  const entryPoint = path.join(__dirname, '..', 'remotion', 'index.js');
  const bundleLocation = await bundle({ entryPoint });
  const composition = await selectComposition({ serveUrl: bundleLocation, id: 'ShortVideo' });
  const outputPath = path.join(__dirname, '..', 'out', 'test_gpu_angle.mp4');

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    frameRange: [0, 30],
    chromiumOptions: {
      gl: 'angle' // Dedicated GPU via DirectX D3D11
    },
    concurrency: 4,
    onProgress: ({ progress }) => {
      console.log(`Progress: ${Math.floor(progress * 100)}%`);
    }
  });

  console.log('GPU ANGLE Render Selesai:', outputPath, 'Size:', fs.statSync(outputPath).size);
}

testAngleGpu().catch(console.error);
