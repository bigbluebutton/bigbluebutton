// Playwright configuration of docker/tests/stack/recording-e2e.sh: one test, Chromium with the
// fake media devices of upstream's configuration (bigbluebutton-tests/playwright/core/setup/
// browsersConfig.ts), no retries.
import { defineConfig } from '@playwright/test';

import { chromiumConfig } from '../core/setup/browsersConfig';

export default defineConfig({
  testDir: '.',
  testMatch: /recording-e2e\.spec\.ts$/,
  workers: 1,
  retries: 0,
  timeout: 5 * 60 * 1000,
  reporter: [['list']],
  outputDir: './test-results',
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    actionTimeout: 20 * 1000,
  },
  projects: [chromiumConfig],
});
