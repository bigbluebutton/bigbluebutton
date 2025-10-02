import path from 'path';

export const chromiumConfig = {
  name: 'Chromium',
  use: {
    browserName: 'chromium' as const,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--ignore-certificate-errors',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-file-access-from-files',
        `--use-file-for-fake-video-capture=${path.join(__dirname, 'media/video.y4m')}`,
      ],
    },
  },
};

export const firefoxConfig = {
  name: 'Firefox',
  use: {
    browserName: 'firefox' as const,
    launchOptions: {
      args: ['--quiet', '--use-test-media-devices'],
      firefoxUserPrefs: {
        'media.navigator.streams.fake': true,
        'media.navigator.permission.disabled': true,
      },
    },
  },
};

export const webkitConfig = {
  name: 'WebKit',
  use: {
    browserName: 'webkit' as const,
    launchOptions: {
      args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
};
