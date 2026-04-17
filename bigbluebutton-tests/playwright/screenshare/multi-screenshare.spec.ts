import { test } from '../core/setup/fixtures';
import { ScreenShare } from './screenshare';

test.describe.parallel('Multi-screenshare', { tag: '@ci' }, () => {
  // T22 — Moderador não-presenter compartilha (R2)
  // Pre-condition: 2 moderators in the meeting; only one is presenter; the other NEVER promoted.
  // The second moderator must be able to start screenshare without any role change.
  test('non-presenter moderator can start screenshare without promotion', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initModPage2(context, { testInfo });
    await screenshare.moderatorNonPresenterSharesScreen();
  });
});
