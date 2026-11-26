import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import { chromiumConfig } from '../../core/setup/browsersConfig';

dotenv.config();

// The layout perf harness: its own config so the measurements never run with the functional suite.
// One worker, no retries, no traces or videos (they would cost CPU inside the measurement).
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.perf\.ts$/,
  workers: 1,
  retries: 0,
  timeout: 5 * 60 * 1000,
  reporter: [['list']],
  use: {
    headless: true,
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  projects: [chromiumConfig],
});
