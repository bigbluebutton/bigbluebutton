require('dotenv').config();
const { chromiumConfig, firefoxConfig, webkitConfig } = require('./core/browsersConfig');

const CI = process.env.CI === 'true';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

const config = {
  workers: CI ? 1 : 2,
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
    chromiumConfig,
    firefoxConfig,
    webkitConfig,
  ],
};

if (CI) config.retries = 1;

module.exports = config;
