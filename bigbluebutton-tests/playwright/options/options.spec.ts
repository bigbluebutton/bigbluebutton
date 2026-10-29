import { initializePages, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Options } from './options';

// Shown as "Join by URL" in the session details; the client never opens it.
const JOIN_URL = 'https://bbb-test-stub.local/join/session-details';

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

  test('Locales', { tag: '@nightly' }, async () => {
    await options.localesTest();
  });

  test('Dark mode', async () => {
    await options.darkMode();
  });

  test('Font size', async () => {
    await options.fontSizeTest();
  });

  test('Auto hide whiteboard toolbar', { tag: '@known-issue' }, async () => {
    linkIssue(24367);
    await options.autoHideWhiteboardToolbar();
  });

  test('Options dropdown keyboard navigation', async () => {
    await options.keyboardNavigationOptionsDropdown();
  });

  test('Unsaved settings changes', async () => {
    await options.unsavedSettingsChanges();
  });

  test('Dark mode kept after reload', async () => {
    await options.darkModeKeptAfterReload();
  });

  // the layout observer resets the page font size to public.app.desktopFontSize on every load, ignoring the saved one
  test('Font size kept after reload', { tag: '@known-issue' }, async () => {
    linkIssue(26129);
    await options.fontSizeKeptAfterReload();
  });

  test('Right-to-left layout', async () => {
    await options.rightToLeftLayout();
  });

  test('Locale kept after reload', async () => {
    await options.localeKeptAfterReload();
  });

  test.describe('Data savings', () => {
    test('Webcam sharing settings', { tag: '@media' }, async () => {
      await options.initUserPage(options.modPage.context);
      await options.enableOtherParticipantsWebcams();
    });

    test('Desktop sharing settings', { tag: '@media' }, async () => {
      await options.initUserPage(options.modPage.context);
      await options.enableOtherParticipantsDesktopSharing();
    });
  });
});

test.describe.parallel('Session details', { tag: '@ci' }, () => {
  test('Open from the meeting title and copy the join URL', async ({ browser, context, page }, testInfo) => {
    const options = new Options(browser, context);
    await options.initModPage(page, { createParameter: `loginURL=${encodeURIComponent(JOIN_URL)}`, testInfo });
    await options.sessionDetails(JOIN_URL);
  });
});
