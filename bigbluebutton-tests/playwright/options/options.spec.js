import { test } from '../fixtures';
import { Options } from './options';
import { initializePages } from '../core/helpers.ts';

test.describe.parallel('Options', { tag: '@ci' }, () => {
  const options = new Options();

  test.beforeEach(async ({ browser }, testInfo) => {
    await initializePages(options, browser, { testInfo });
  });

  test('Open about modal', async () => {
    await options.openedAboutModal();
  });

  test('Open Help Button', async () => {
    await options.openHelp();
  });

  test('Locales', async () => {
    await options.localesTest();
  });

  test('Dark mode', async () => {
    await options.darkMode();
  });

  test('Font size', async () => {
    await options.fontSizeTest();
  });

  test('Auto hide whiteboard toolbar', async () => {
    await options.autoHideWhiteboardToolbar();
  });
});
