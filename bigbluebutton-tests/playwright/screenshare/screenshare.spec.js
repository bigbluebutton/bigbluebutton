const { test } = require('../fixtures');
const { devices } = require('@playwright/test');
const { ScreenShare } = require('./screenshare');

test.describe.parallel('Screenshare', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#sharing-screen-in-full-screen-mode-automated
  test('Share screen @ci', async ({ browser, browserName, page }) => {
    test.skip(browserName === 'firefox' && process.env.DISPLAY === undefined,
      'Screenshare tests not able in Firefox browser without desktop'
    );
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.startSharing();
  });

  test('Start screenshare stops external video @ci', async ({ browser, page, browserName }) => {
    test.skip(browserName === 'firefox', 'local is working, on ci is inconsistent');
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.screenshareStopsExternalVideo();
  });

  test.describe.parallel('Mobile', () => {
    test.beforeEach(({ browserName }) => {
      test.skip(browserName === 'firefox', 'Mobile tests are not able in Firefox browser');
    });

    test('Share screen unavailable on Mobile Android', async ({ browser }) => {
      const motoG4 = devices['Moto G4'];
      const context = await browser.newContext({ ...motoG4 });
      const page = await context.newPage();
      const screenshare = new ScreenShare(browser, page);
      await screenshare.init(true, true);
      await screenshare.testMobileDevice();
    });

    test('Share screen unavailable on Mobile iPhone', async ({ browser }) => {
      const iPhone11 = devices['iPhone 11'];
      const context = await browser.newContext({ ...iPhone11 });
      const page = await context.newPage();
      const screenshare = new ScreenShare(browser, page);
      await screenshare.init(true, true);
      await screenshare.testMobileDevice();
    });

    test('Share screen unavailable on Tablet iPad', async ({ browser }) => {
      const iPadPro11 = devices['iPad Pro 11'];
      const context = await browser.newContext({ ...iPadPro11 });
      const page = await context.newPage();
      const screenshare = new ScreenShare(browser, page);
      await screenshare.init(true, true);
      await screenshare.testMobileDevice();
    });
  });
});
