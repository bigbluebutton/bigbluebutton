import { initializePages } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Options } from './options';

test.describe.parallel('Options', { tag: '@ci' }, () => {
  let options: Options;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    options = new Options(browser, context);
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

  test.describe('Data savings', () => {
    test('Webcam sharing settings', async () => {
      await options.initUserPage(options.modPage.context);
      await options.enableOtherParticipantsWebcams();
    });

    test('Desktop sharing settings', async () => {
      await options.initUserPage(options.modPage.context);
      await options.enableOtherParticipantsDesktopSharing();
    });
  });
});
