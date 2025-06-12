require('dotenv').config();
const { chromiumConfig, firefoxConfig, webkitConfig } = require('./core/browsersConfig');
const { ELEMENT_WAIT_TIME, CI, ELEMENT_WAIT_LONGER_TIME } = require('./core/constants');

const isParallel = !!process.env.npm_config_parallel;

const config = {
  workers: CI ? 1 : 2,
  timeout: 3 * 60 * 1000,
  reporter: CI
    ? [['blob'], ['./custom-reporter.js']]
    : [['list'], ['html', { open: 'never' }],
  ],
  reportSlowTests: null,
  forbidOnly: CI,
  fullyParallel: CI || isParallel,
  use: {
    headless: true,
    trace: 'on',
    screenshot: 'on',
    video: CI ? 'retain-on-failure' : 'on',
    actionTimeout: ELEMENT_WAIT_LONGER_TIME,
    viewport: { width: 1366, height: 768 },
  },
  projects: [
    chromiumConfig,
    firefoxConfig,
    webkitConfig,
  ],
  expect: {
    timeout: ELEMENT_WAIT_TIME,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
      timeout: ELEMENT_WAIT_TIME,
    },
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      timeout: ELEMENT_WAIT_TIME,
    },
  },
};

if (CI) config.retries = 1;

module.exports = config;
