const { test, devices } = require('@playwright/test');
const { ScreenShare } = require('./screenshare');

test.describe.parallel('Screenshare', () => {
  test('Share screen', async ({ browser, page }) => {
    const screenshare = new ScreenShare(browser, page);
    await screenshare.init(true, true);
    await screenshare.startSharing();
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
