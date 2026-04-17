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

  // T06 — Lock "Share screen" (hideViewersScreenshare) blocks viewer without promotion (R13, R15, R3)
  // Pre-condition: moderator (presenter) + viewer (NEVER promoted to presenter at any point).
  // The lock is activated by the moderator via the lock-viewers modal.
  // Viewer button must disappear; moderator can still share; viewer stays in participant list.
  // After deactivating the lock, viewer can share again.
  test('lock disableMultiScreenshare blocks viewer without promotion', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.lockBlocksViewerNoPromotion();
  });

  // T19 — Blocked screenshare attempt does not eject viewer from meeting (R3)
  // Pre-condition: moderator (presenter) + viewer. Lock enabled by moderator.
  // Server-side lock denies the share (explicit denial via GetScreenBroadcastPermissionRespMsg).
  // Viewer must remain in participant list — no EjectUserCmdMsg is sent.
  test('locked screenshare attempt does not eject viewer', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.lockedAttemptNoEject();
  });
});
