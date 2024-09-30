const { test } = require('../fixtures');
const { devices } = require('@playwright/test');
const { ScreenShare } = require('./screenshare');

test.describe.parallel('Screenshare', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#sharing-screen-in-full-screen-mode-automated
  test('Share screen', { tag: '@ci' }, async ({ browser, browserName, page }) => {
    test.skip(browserName === 'firefox',
      'Screenshare tests not able in Firefox browser without desktop',
    );
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.startSharing();
  });

  test('Start screenshare stops external video', { tag: [ '@ci', '@flaky' ] }, async ({ browser, page }) => {
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.screenshareStopsExternalVideo();
  });
});
