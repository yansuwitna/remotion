const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');

async function checkArgs() {
  const entryPoint = path.join(__dirname, '..', 'remotion', 'index.js');
  const bundleLocation = await bundle({ entryPoint });
  const composition = await selectComposition({ serveUrl: bundleLocation, id: 'ShortVideo' });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: path.join(__dirname, '..', 'out', 'test_args.mp4'),
    frameRange: [0, 5],
    ffmpegOverride: ({ type, args }) => {
      console.log(`TYPE: ${type}`);
      console.log('ARGS:', JSON.stringify(args, null, 2));
      return args;
    }
  });
}

checkArgs().catch(console.error);
