require('dotenv').config();
const parameters = require('./core/parameters');

const config = {
  use: {
    headless: true,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--disable-features=IsolateOrigins,site-per-process',
      ]
    }
  },
  workers: 1,
};

module.exports = config;
