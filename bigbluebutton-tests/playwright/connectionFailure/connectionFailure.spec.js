const { test, devices } = require('@playwright/test');
const { ScreenShare, MultiUserScreenShare } = require('../screenshare/screenshare');
const { sleep } = require('../core/helpers');
const e = require('../core/elements');
const { getCurrentTCPSessions, killTCPSessions } = require('./util');
const notificationsUtil = require('../notifications/util');
const deepEqual = require('deep-equal');

test.describe.parallel('Connection failure', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#sharing-screen-in-full-screen-mode-automated
  test('Screen sharer', async ({ browser, browserName, page }) => {
    test.skip(browserName === 'firefox' && process.env.DISPLAY === undefined,
              "Screenshare tests not able in Firefox browser without desktop");
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.startSharing();

    await killTCPSessions(await getCurrentTCPSessions());

    // I'd like to do this:
    // await notificationsUtil.checkNotificationText(screenshare, "Code 1101. Try sharing the screen again.");

    // but that code only checks the first toast, and there's a bunch of toasts that show up
    // on this test.  So instead I use xpath, like this: (should we do it this way in checkNotificationText?)
    await screenshare.hasElement('//div[@data-test="toastSmallMsg"]/span[contains(text(), "Code 1101. Try sharing the screen again.")]');
  });

  test('Screen share viewer', async ({ browser, browserName, page, context }) => {
    test.skip(browserName === 'firefox' && process.env.DISPLAY === undefined,
              "Screenshare tests not able in Firefox browser without desktop");
    const screenshare = new MultiUserScreenShare(browser, context);

    await screenshare.initModPage(page);
    await screenshare.startSharing(screenshare.modPage);

    const tcpModeratorSessions = await getCurrentTCPSessions();

    await screenshare.initUserPage(false);
    await screenshare.userPage.joinMicrophone();
    await screenshare.userPage.hasElement(e.screenShareVideo);

    const tcpSessions = await getCurrentTCPSessions();
    // Other comparisons, like == or the array includes method, don't do a deep comparison
    // and will always return false since the two arrays contain different objects.
    const tcpUserSessions = tcpSessions.filter(x => !tcpModeratorSessions.some(e => deepEqual(e,x)));
    killTCPSessions(tcpUserSessions);

    await screenshare.userPage.hasElement('//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]');
    await screenshare.userPage.wasRemoved('//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]');
  });
});
