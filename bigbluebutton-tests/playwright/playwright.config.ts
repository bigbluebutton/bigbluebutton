import dotenv from 'dotenv';

import { defineConfig } from '@playwright/test';
import { chromiumConfig, firefoxConfig, webkitConfig } from './core/setup/browsersConfig';
import { ELEMENT_WAIT_TIME, CI, ELEMENT_WAIT_LONGER_TIME } from './core/constants';

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
    trace: 'on',
    screenshot: 'on',
    video: CI ? 'retain-on-failure' : 'on',
    actionTimeout: ELEMENT_WAIT_LONGER_TIME,
  },
  projects: [{ name: 'setup', testMatch: /global\.setup\.ts/ }, chromiumConfig, firefoxConfig, webkitConfig],
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
