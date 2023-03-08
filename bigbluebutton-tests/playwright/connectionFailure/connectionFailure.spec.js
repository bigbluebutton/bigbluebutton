const { test, devices } = require('@playwright/test');
const { ScreenShare, MultiUserScreenShare } = require('../screenshare/screenshare');
const { sleep } = require('../core/helpers');
const e = require('../core/elements');
const { getCurrentTCPSessions, killTCPSessions } = require('./util');
const deepEqual = require('deep-equal');

test.describe.parallel('Connection failure', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#sharing-screen-in-full-screen-mode-automated
  test('Share screener', async ({ browser, browserName, page }) => {
    test.skip(browserName === 'firefox' && process.env.DISPLAY === undefined,
              "Screenshare tests not able in Firefox browser without desktop");
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.startSharing();

    await killTCPSessions(await getCurrentTCPSessions());

    // we now get an "Code 1101. Try sharing the screen again."

    await sleep(5 * 1000);
  });

  test('Share screen viewer', async ({ browser, browserName, page, context }) => {
    test.skip(browserName === 'firefox' && process.env.DISPLAY === undefined,
              "Screenshare tests not able in Firefox browser without desktop");
    const screenshare = new MultiUserScreenShare(browser, context);

    await screenshare.initModPage(page);
    await screenshare.startSharing(screenshare.modPage);

    const tcpModeratorSessions = await getCurrentTCPSessions();
    //console.log('tcpModeratorSessions', tcpModeratorSessions);

    await screenshare.initUserPage(false);
    await screenshare.userPage.joinMicrophone();
    await screenshare.userPage.hasElement(e.screenShareVideo);

    const tcpSessions = await getCurrentTCPSessions();
    // Other comparisons, like == or the array includes method, don't do a deep comparison
    // and will always return false since the two arrays contain different objects.
    const tcpUserSessions = tcpSessions.filter(x => !tcpModeratorSessions.some(e => deepEqual(e,x)));
    //console.log('tcpUserSessions', tcpUserSessions);
    killTCPSessions(tcpUserSessions);

    await sleep(5 * 1000);

    const tcpSessions2 = await getCurrentTCPSessions();
    const tcpUserSessions2 = tcpSessions2.filter(x => !tcpModeratorSessions.some(e => deepEqual(e,x)));
    //console.log('tcpUserSessions2', tcpUserSessions2);
    killTCPSessions(tcpUserSessions2);

    await sleep(5 * 1000);
  });
});
