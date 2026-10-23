import { devices } from '@playwright/test';

import { exposeLiveKitRooms, isLiveKit } from '../core/livekit';
import { refuseMedia } from '../core/mediaPermissions';
import { trackPeerConnections } from '../core/rtcStatsProbe';
import { test } from '../core/setup/fixtures';
import { ScreenShare } from './screenshare';

const iPhone11 = devices['iPhone 11'];
const MOBILE_SCREENSHARE_SETTINGS = {
  public: { kurento: { screenshare: { enableOnMobile: true } } },
};

test.describe.parallel('Screenshare', { tag: ['@ci', '@media'] }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sharing-screen-in-full-screen-mode-automated
  test('Start and Stop Share screen', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.startSharing();
    await screenshare.stopSharing();
  });

  test('A user who joins during a screenshare receives it', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    await trackPeerConnections(context);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.lateJoinerReceivesScreenshare();
  });

  test('A refused screen capture leaves the start button usable', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    await refuseMedia(page, ['display']);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.refusedScreenCapture();
  });

  test('Webcams fill the media area after screenshare ends when no presentation is loaded', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.webcamsFillAreaAfterSharingWithoutPresentation();
  });

  test('Non-LiveKit screenshare survives a LiveKit drop', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    test.skip(!isLiveKit, 'a LiveKit participant close needs the LiveKit audio bridge');
    const screenshare = new ScreenShare(browser, context);
    await exposeLiveKitRooms(page);
    await screenshare.initModPage(page, {
      testInfo,
      createParameter: 'audioBridge=livekit&screenShareBridge=bbb-webrtc-sfu',
    });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.keepSharingAcrossLiveKitDrop();
  });

  test('Screenshare stops when the presenter leaves', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.presenterLeaveStopsSharing();
  });

  test('Screenshare stops when the presenter changes', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.presenterChangeStopsSharing();
  });

  test('Hidden presentation stays hidden after screenshare ends when the slide has annotations', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.presentationStaysHiddenAfterSharingWithAnnotations();
  });

  test('Start screenshare stops external video', async ({ browser, context, page }, testInfo) => {
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.screenshareStopsExternalVideo();
  });

  test('Mobile screen sharing stays hidden by default', async ({ browser, context }, testInfo) => {
    const mobileContext = await browser.newContext({ ...iPhone11 });
    const mobilePage = await mobileContext.newPage();
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(mobilePage, { testInfo });
    await screenshare.testMobileDevice();
  });

  test('Mobile presenter can share when enabled', async ({ browser, context }, testInfo) => {
    await trackPeerConnections(context);
    const mobileContext = await browser.newContext({ ...iPhone11 });
    const mobilePage = await mobileContext.newPage();
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(mobilePage, {
      testInfo,
      clientSettingsOverrides: MOBILE_SCREENSHARE_SETTINGS,
    });
    await screenshare.mobilePresenterSharesToDesktopViewer();
  });

  test('Mobile screen sharing stays hidden without browser support', async ({ browser, context }, testInfo) => {
    const mobileContext = await browser.newContext({ ...iPhone11 });
    await mobileContext.addInitScript(() => {
      Object.defineProperty(navigator, 'getDisplayMedia', { value: undefined });
      Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', { value: undefined });
    });
    const mobilePage = await mobileContext.newPage();
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(mobilePage, {
      testInfo,
      clientSettingsOverrides: MOBILE_SCREENSHARE_SETTINGS,
    });
    await screenshare.testMobileDevice();
  });
});
