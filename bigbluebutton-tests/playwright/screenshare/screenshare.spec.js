const { test } = require('../fixtures');
const { ScreenShare } = require('./screenshare');
const { linkIssue } = require('../core/helpers');

test.describe.parallel('Screenshare', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sharing-screen-in-full-screen-mode-automated
  test('Start and Stop Share screen', async ({ browser, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox',
      'Screenshare tests not able in Firefox browser without desktop',
    );
    const screenshare = new ScreenShare(browser, page, testInfo);
    await screenshare.init(true, true);
    await screenshare.startSharing();
    await screenshare.stopSharing();
  });

  test('Start screenshare stops external video', { tag: '@flaky' }, async ({ browser, page }, testInfo) => {
    // requiring logged user to start external video on CI environment
    linkIssue(21589);
    const screenshare = new ScreenShare(browser, page, testInfo);
    await screenshare.init(true, true);
    await screenshare.screenshareStopsExternalVideo();
  });
});
