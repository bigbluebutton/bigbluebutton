require('dotenv').config();

const CI = process.env.CI === 'true';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

const config = {
  workers: 2,
  timeout: 3 * 60 * 1000,
  reporter: [
    [CI ? 'github' : 'list'],
    ['html', { open: 'never' }],
  ],
  forbidOnly: CI,
  use: {
    headless: true,
    trace: DEBUG_MODE ? 'on'
      : CI ? 'retain-on-failure'
      : 'off',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'Chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--ignore-certificate-errors',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ]
        },
      },
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        launchOptions: {
          firefoxUserPrefs: {
            "media.navigator.streams.fake": true,
            "media.navigator.permission.disabled": true,
          }
        },
      },
    },
    {
      name: 'WebKit',
      use: {
        browserName: 'webkit',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ]
        },
      },
    },
  ],
};

if (CI) config.retries = 1;

module.exports = config;
