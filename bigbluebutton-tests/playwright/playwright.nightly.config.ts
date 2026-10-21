import { defineConfig } from '@playwright/test';

// eslint-disable-next-line import/extensions
import baseConfig from './playwright.config';

// Used by .github/workflows/nightly-tests.yml, which sets TIMEOUT_MULTIPLIER=2 and leaves CI as GitHub
// sets it. The rest is set here whatever CI is: one worker, one retry, and traces and videos of failed
// tests only.
export default defineConfig(baseConfig, {
  workers: 1,
  retries: 1,
  reporter: [['list'], ['blob'], ['./core/setup/customReporter.ts']],
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
});
