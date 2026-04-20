import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import { CI, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from './core/constants';
import { chromiumConfig } from './core/setup/browsersConfig';

dotenv.config();

export default defineConfig({
  workers: CI ? 1 : 2,
  timeout: 3 * 60 * 1000,
  reporter: CI ? [['blob'], ['./core/setup/customReporter.ts']] : [['list'], ['html', { open: 'never' }]],
  reportSlowTests: null,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  captureGitInfo: {
    commit: true,
    diff: true,
  },
  use: {
    headless: true,
    screenshot: 'on',
    trace: CI ? 'retain-on-failure' : 'on',
    video: CI ? 'retain-on-failure' : 'on',
    actionTimeout: ELEMENT_WAIT_LONGER_TIME,
    ignoreHTTPSErrors: true,
    ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}),
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      ...chromiumConfig,
      dependencies: ['setup'],
    },
    /**
     * ! avoiding following browsers since not fully supported yet
     * When support is added, uncomment the code and use imports at the top
     * also update mention on README (bigbluebutton/bigbluebutton-tests/playwright/README.md)
     */
    // {
    //   ...firefoxConfig,
    //   dependencies: ['setup'],
    // },
    // {
    //   ...webkitConfig,
    //   dependencies: ['setup'],
    // },
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
});
