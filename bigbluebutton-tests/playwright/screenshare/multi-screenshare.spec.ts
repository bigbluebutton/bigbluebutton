import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { ScreenShare } from './screenshare';

test.describe.parallel('Multi-screenshare', { tag: '@ci' }, () => {
  // T22: non-presenter moderator can share screen (R2)
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

  // T04: slides -> screen1 -> screen2 -> slides cycle (R7, R8, R10, R11)
  // Pre-condition: presenter (modPage) + viewer (userPage). Presentation with slides loaded.
  // Viewer NEVER promoted to presenter.
  // Step 1: Slides visible. Step 2: Presenter screenshare → content area (R7).
  // Step 3: Viewer screenshare → camera dock (R9). Step 4: Presenter promotes viewer screenshare
  //         via "Show as content" → viewer in content area, presenter migrates to camera dock (R8, R10).
  // Step 5: Both stop → slides return to content area (R11 fallback).
  test('content area full cycle: slides → screenshare → promotion → slides', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.contentAreaFullCycle();
  });

  // T03: only one screenshare occupies the presentation area (R6, R7, R9)
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

  // T06 -- Lock "Share screen" (disableMultiScreenshare) blocks viewer without promotion (R13, R15, R3)
  // Pre-condition: moderator (presenter) + viewer (NEVER promoted to presenter at any point).
  // The moderator activates disableMultiScreenshare via the lock-viewers modal.
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

  // T11: presenter swap keeps active screenshares running (R8, R12)
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

  // T12: external video migrates presenter screenshare to the camera dock (R8, R9, R11)
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

  // T07: activating the lock stops active viewer screenshares while moderator keeps sharing (R14, R13)
  // Pre-condition: moderator (presenter) + viewer BOTH sharing. Lock initially OFF. Viewer NEVER promoted.
  // Steps: both share → mod activates disableMultiScreenshare → viewer share stopped by server
  //        (no viewer click) → mod share survives → viewer cannot re-share while lock is active.
  test('lock disableMultiScreenshare stops active viewer screenshare server-side while keeping moderator stream alive', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    test.setTimeout(120000);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.lockStopsActiveViewerShares();
  });

  // T08 -- hideViewersScreenshare enforced server-side via HTTP GraphQL query (R16, R17)
  // Pre-condition: moderator (presenter) + viewer1 + viewer2. Lock initially OFF.
  // Both viewers start screenshare. Viewer1 makes a direct HTTP GraphQL query:
  //   before lock → 2 rows visible; after lock → only 1 row (own).
  // Proves the filter is server-side: the raw HTTP response is filtered by Hasura RLS.
  test('T08 -- hideViewersScreenshare enforced server-side', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    test.setTimeout(120000);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.initUserPage2(context, { testInfo });
    await screenshare.hideViewersScreenshareEnforcedServerSide();
  });

  // T19 -- Blocked screenshare attempt does not eject viewer from meeting (R3)
  // Pre-condition: moderator (presenter) + viewer. Lock enabled by moderator.
  // Server-side lock denies the share (explicit denial via GetScreenBroadcastPermissionRespMsg).
  // Viewer must remain in participant list -- no EjectUserCmdMsg is sent.
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

  // T14 -- Path SFU/Kurento maintains singleton even with multiScreenshare flag on (R22)
  // Pre-condition: meeting created with screenShareBridge=bbb-webrtc-sfu; multiScreenshare NOT disabled.
  // Viewer is NEVER promoted to presenter.
  // Asserts: (1) viewer does NOT see screenshare button (bridge != livekit → multi-screenshare gate closes);
  //          (2) presenter sees the button (singleton behavior intact).
  test('SFU bridge keeps singleton behavior even when multiScreenshare flag is on', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { createParameter: c.sfuScreenShareBridge, testInfo });
    await screenshare.initUserPage(context, { createParameter: c.sfuScreenShareBridge, testInfo });
    await screenshare.sfuPathLegacySingleton();
  });

  // T13 -- Feature flag off → legacy behavior preserved (R21)
  // Pre-condition: meeting created with disabledFeatures=multiScreenshare; presenter + viewer.
  // Viewer is NEVER promoted to presenter.
  // Asserts: (1) viewer does NOT see screenshare button (legacy: only presenter shares);
  //          (2) presenter still sees the button (singleton behavior intact);
  //          (3) new lock settings toggles (disableMultiScreenshare, hideViewersScreenshare)
  //              are NOT shown in Lock Viewers modal.
  test('feature flag off preserves legacy behavior', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not available in Firefox without desktop capture');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { createParameter: c.multiScreenshareDisabled, testInfo });
    await screenshare.initUserPage(context, { createParameter: c.multiScreenshareDisabled, testInfo });
    await screenshare.featureFlagOffLegacyBehavior();
  });
});
