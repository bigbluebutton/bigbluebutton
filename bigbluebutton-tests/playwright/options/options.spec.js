const { test } = require('../fixtures');
const { Options } = require('./options');
const { initializePages } = require('../core/helpers');

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

  test.describe('Data savings', () => {
    test('Webcam sharing settings', async () => {
      await options.initUserPage(true, options.modPage.context)
      await options.enableOtherParticipantsWebcams();
    });

    test('Desktop sharing settings', async () => {
      await options.initUserPage(true, options.modPage.context)
      await options.enableOtherParticipantsDesktopSharing();
    });
  });
})
