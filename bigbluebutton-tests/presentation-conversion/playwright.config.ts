import { defineConfig, ReporterDescription } from '@playwright/test';
import { loadDotEnv } from './src/env';

loadDotEnv();
process.env.PC_PROFILE ||= 'defaults';
process.env.PC_RUN_ID ||= new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const profile = process.env.PC_PROFILE;

const reporter: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never', outputFolder: `playwright-report/${profile}` }],
  ['json', { outputFile: `results/${profile}/report.json` }],
];
if (process.env.CI) reporter.push(['blob', { outputFile: `blob-report/report-${profile}.zip` }]);

export default defineConfig({
  testDir: './specs',
  outputDir: `test-results/${profile}`,
  snapshotDir: process.env.PC_SNAPSHOT_DIR || './goldens',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 5 * 60_000,
  updateSnapshots: 'none',
  reporter,
  projects: [
    { name: 'convert', testMatch: /convert\.setup\.ts/, timeout: 90 * 60_000 },
    { name: 'verify', testMatch: /.*\.spec\.ts/, dependencies: ['convert'] },
  ],
});
