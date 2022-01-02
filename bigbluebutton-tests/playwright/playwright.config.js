require('dotenv').config();

const config = {
  workers: 1,
  timeout: 3 * 60 * 1000,
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
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ]
        },
      },
    },
  ],
};

module.exports = config;
