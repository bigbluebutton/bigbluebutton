const path = require('path');

const chromiumConfig = {
  name: 'Chromium',
  use: {
    browserName: 'chromium',
    launchOptions: {
      args: [
        '--no-sandbox',
        '--ignore-certificate-errors',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-file-access-from-files',
        `--use-file-for-fake-video-capture=${path.join(__dirname, 'media/video.y4m')}`
      ],
    },
  },
};

const firefoxConfig = {
  name: 'Firefox',
  use: {
    browserName: 'firefox',
    launchOptions: {
      args: [
        '--quiet',
        '--use-test-media-devices',
      ],
      firefoxUserPrefs: {
        "media.navigator.streams.fake": true,
        "media.navigator.permission.disabled": true,
      }
    },
  },
};

const webkitConfig = {
  name: 'WebKit',
  use: {
    browserName: 'webkit',
    devices: ['Desktop Safari'],
    launchOptions: {
      args: [
        //'--no-sandbox',
        //'--use-fake-ui-for-media-stream',
        //'--use-fake-device-for-media-stream',
      ]
    },
  },
};

exports.chromiumConfig = chromiumConfig;
exports.firefoxConfig = firefoxConfig;
exports.webkitConfig = webkitConfig;
