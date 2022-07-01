require('dotenv').config();

const config = {
  workers: 1,
  timeout: 3 * 60 * 1000,
  reporter: [['list']],
  use: {
    headless: true,
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

if (process.env.DEBUG_MODE === 'true') {
  config.reporter.push(['html', { open: 'never' }]);
  config.use.screenshot = 'only-on-failure';
  config.use.trace = 'retain-on-failure';
}

module.exports = config;
