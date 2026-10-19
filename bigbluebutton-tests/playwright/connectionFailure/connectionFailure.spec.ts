import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { RECONNECTION_TIME, routeServerConnection, SHOW_RECONNECTING_TOAST } from '../reconnection/util';
import { ScreenShare } from '../screenshare/screenshare';

// the connection is dropped from inside the browser: no root permission needed, and the
// connections of the other pages and workers are left alone
test.describe.parallel('Connection failure', () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sharing-screen-in-full-screen-mode-automated
  // not @ci: the share stops when the reconnection loses the race with akka's 10 s removal of left users
  test('Screen share', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const connection = await routeServerConnection(page);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo, clientSettingsOverrides: SHOW_RECONNECTING_TOAST });
    await screenshare.initUserPage(context, { testInfo });
    test.skip(!screenshare.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await screenshare.startSharing();
    await screenshare.userPage.hasElement(
      e.screenShareVideo,
      'the viewer should see the screen share',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    const dropped = connection.drop();
    expect(dropped.graphql, 'should drop the presenter graphql connection').toBeGreaterThan(0);
    if (isLiveKit) {
      expect(dropped.liveKitSignal, 'should drop the presenter LiveKit signal connection').toBeGreaterThan(0);
    }
    await screenshare.modPage.hasElement(
      e.reconnectingToast,
      'should display the reconnection in progress toast to the presenter after connection lost',
    );
    await screenshare.modPage.wasRemoved(
      e.reconnectingToast,
      'reconnection in progress toast should be removed after the presenter reconnects',
      RECONNECTION_TIME,
    );

    await screenshare.modPage.hasElement(e.isSharingScreen, 'the presenter should still be sharing after reconnecting');
    await screenshare.userPage.hasElement(
      e.screenShareVideo,
      'the viewer should still see the screen share after the presenter reconnects',
    );
  });

  test('Screen share viewer', { tag: '@ci' }, async ({ browser, browserName, page, context }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);

    await screenshare.initModPage(page, { testInfo });
    test.skip(!screenshare.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await screenshare.startSharing();

    const viewerPage = await context.newPage();
    const connection = await routeServerConnection(viewerPage);
    screenshare.userPage = new Page(browser, viewerPage, testInfo);
    await screenshare.userPage.init(false, {
      fullName: 'Attendee',
      meetingId: screenshare.modPage.meetingId,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: SHOW_RECONNECTING_TOAST,
    });
    await screenshare.userPage.joinMicrophone();
    await screenshare.userPage.hasElement(e.screenShareVideo, 'should display the screen share video element');

    const dropped = connection.drop();
    expect(dropped.graphql, 'should drop the viewer graphql connection').toBeGreaterThan(0);
    if (isLiveKit) {
      expect(dropped.liveKitSignal, 'should drop the viewer LiveKit signal connection').toBeGreaterThan(0);
    }
    await screenshare.userPage.hasElement(
      e.reconnectingToast,
      'should display the reconnection in progress toast to the viewer after connection lost',
    );
    await screenshare.userPage.wasRemoved(
      e.reconnectingToast,
      'reconnection in progress toast should be removed after the viewer reconnects',
      RECONNECTION_TIME,
    );
    await screenshare.userPage.hasElement(
      e.screenShareVideo,
      'the viewer should see the screen share after reconnecting',
    );
  });
});
