import { devices, Project } from '@playwright/test';
import path from 'path';

export const chromiumConfig: Project = {
  name: 'Chromium',
  use: {
    ...devices['Desktop Chrome'],
    browserName: 'chromium' as const,
    viewport: { width: 1366, height: 768 },
    launchOptions: {
      args: [
        '--no-sandbox',
        '--ignore-certificate-errors',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-file-access-from-files',
        `--use-file-for-fake-video-capture=${path.join(__dirname, '../media/video.y4m')}`,
      ],
    },
  },
};

export const firefoxConfig: Project = {
  name: 'Firefox',
  use: {
    ...devices['Desktop Firefox'],
    browserName: 'firefox' as const,
    viewport: { width: 1366, height: 768 },
    launchOptions: {
      args: ['--quiet', '--use-test-media-devices'],
      firefoxUserPrefs: {
        'media.navigator.streams.fake': true,
        'media.navigator.permission.disabled': true,
      },
    },
  },
};

export const webkitConfig: Project = {
  name: 'WebKit',
  use: {
    ...devices['Desktop Safari'],
    browserName: 'webkit' as const,
    viewport: { width: 1366, height: 768 },
    launchOptions: {
      args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
};
