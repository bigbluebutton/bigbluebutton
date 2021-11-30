require('dotenv').config();
const parameters = require('./core/parameters');

const config = {
  workers: 1,
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
            '--disable-features=IsolateOrigins,site-per-process',
          ]
        },
      },
    },
  ],
};

module.exports = config;
