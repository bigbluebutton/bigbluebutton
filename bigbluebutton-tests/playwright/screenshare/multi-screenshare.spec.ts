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

  // T03 — Apenas um screenshare na área de apresentação (R6, R7, R9)
  // Pre-condition: moderator (presenter) + viewer. Viewer NEVER promoted to presenter.
  // Step 1: Presenter starts screenshare → content area.
  // Step 2: Viewer starts screenshare → camera dock (R9: viewers never occupy content area on their own).
  // Assert: content area has exactly one screenshare (presenter's stream ID);
  //         viewer's tile in camera dock; viewer was never promoted.
  test('viewer screenshare goes to camera dock not content area', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.viewerScreenshareInCameraDock();
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

  // T11 — Troca de presenter mantém screenshares ativos (R8, R12)
  // Pre-condition: presenter (modPage) + viewer (userPage) both sharing screen.
  // Viewer is NEVER promoted to presenter in setup.
  // Action: moderator transfers presenter to viewer.
  // Assert: old presenter's screenshare migrates to camera dock (not stopped); both streams remain active.
  test('presenter change keeps screenshares active without stopping', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.presenterChangeKeepsShares();
  });

  // T12 — Vídeo externo migra screenshare do presenter para câmeras (R8, R9, R11)
  // Pre-condition: presenter (modPage) sharing screen, viewer (userPage) sharing screen.
  // Viewer is NEVER promoted to presenter at any point.
  // Action: presenter starts external video.
  // Assert: external video in content area; presenter screenshare migrates to camera dock (not stopped);
  //         viewer screenshare stays in camera dock (not stopped).
  test('external video migrates presenter screenshare to camera area', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.externalVideoMigratesPresenterShare();
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
