import dotenv from 'dotenv';
dotenv.config();

import { PlaywrightTestConfig } from '@playwright/test';
import { chromiumConfig, firefoxConfig, webkitConfig } from './core/browsersConfig';
import { ELEMENT_WAIT_TIME, CI, ELEMENT_WAIT_LONGER_TIME } from './core/constants';

const config: PlaywrightTestConfig = {
  workers: CI ? 1 : 2,
  timeout: 3 * 60 * 1000,
  reporter: CI
    ? [['blob'], ['./custom-reporter.ts']]
    : [['list'], ['html', { open: 'never' }]],
  reportSlowTests: null,
  forbidOnly: CI,
  globalSetup: require.resolve('./global-setup.ts'),
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
    },
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
};

if (CI) config.retries = 1;

export default config;
