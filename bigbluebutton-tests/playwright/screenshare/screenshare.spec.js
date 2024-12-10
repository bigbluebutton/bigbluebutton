const { test } = require('../fixtures');
const { ScreenShare } = require('./screenshare');
const { linkIssue } = require('../core/helpers');

test.describe.parallel('Screenshare', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#sharing-screen-in-full-screen-mode-automated
  test('Share screen', async ({ browser, browserName, page }) => {
    test.skip(browserName === 'firefox',
      'Screenshare tests not able in Firefox browser without desktop',
    );
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.startSharing();
  });

  test('Start screenshare stops external video', { tag: '@flaky' }, async ({ browser, page }) => {
    // requiring logged user to start external video on CI environment
    linkIssue(21589);
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.screenshareStopsExternalVideo();
  });
});
