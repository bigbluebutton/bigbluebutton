import deepEqual from 'deep-equal';

import { elements as e } from '../core/elements';
import { checkRootPermission } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { ScreenShare } from '../screenshare/screenshare';
import { getCurrentTCPSessions, killTCPSessions } from './util';

// @ci Note: This entire test suite is skipped in CI because killing TCP connection
// might result in loss of connection with github server, causing the test to fail

test.describe.parallel('Connection failure', () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sharing-screen-in-full-screen-mode-automated
  test('Screen share', async ({ browser, context, browserName, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.startSharing();

    await killTCPSessions(await getCurrentTCPSessions());

    // I'd like to do this:
    // await notificationsUtil.checkNotificationText(screenshare,
    //   "Code 1101. Try sharing the screen again.");

    // but that code only checks the first toast, and there's a bunch of toasts that show up
    // on this test.  So instead I use xpath, like this:
    // (should we do it this way in checkNotificationText?)
    await screenshare.modPage.hasElement(
      '//div[@data-test="toastSmallMsg"]/span[contains(text(), "Code 1101. Try sharing the screen again.")]',
      'should display the notification element with text "Code 1101. Try sharing the screen again." after connection failure',
    );
  });

  test('Screen share viewer', async ({ browser, browserName, page, context }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);

    await screenshare.initModPage(page, { testInfo });
    await screenshare.startSharing();

    const tcpModeratorSessions = await getCurrentTCPSessions();

    await screenshare.initUserPage(context, { testInfo, shouldCloseAudioModal: false });
    await screenshare.userPage.joinMicrophone();
    await screenshare.userPage.hasElement(e.screenShareVideo, 'should display the screen share video element');

    const tcpSessions = await getCurrentTCPSessions();
    // Other comparisons, like == or the array includes method, don't do a deep comparison
    // and will always return false since the two arrays contain different objects.
    const tcpUserSessions = tcpSessions.filter((x) => !tcpModeratorSessions.some((session) => deepEqual(session, x)));
    await killTCPSessions(tcpUserSessions);

    await screenshare.userPage.hasElement(
      '//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]',
      'should display the notification banner bar with text "Connecting ..." after connection failure',
    );
    await screenshare.userPage.wasRemoved(
      '//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]',
      'should remove the notification banner bar with text "Connecting ..." when reconnected',
    );
  });
});
