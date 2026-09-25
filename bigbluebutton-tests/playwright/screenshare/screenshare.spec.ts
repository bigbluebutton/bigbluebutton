import { linkIssue } from '../core/helpers';
import { exposeLiveKitRooms, isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { ScreenShare } from './screenshare';

test.describe.parallel('Screenshare', { tag: ['@ci', '@media'] }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sharing-screen-in-full-screen-mode-automated
  test('Start and Stop Share screen', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.startSharing();
    await screenshare.stopSharing();
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

  test('Start screenshare stops external video', { tag: '@flaky' }, async ({ browser, context, page }, testInfo) => {
    // requiring logged user to start external video on CI environment
    linkIssue(21589);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.screenshareStopsExternalVideo();
  });
});
