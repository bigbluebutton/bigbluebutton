const { test, devices } = require('@playwright/test');
const Screenshare = require('./screenshare');

test.describe.parallel('Screenshare', () => {
  test('Share screen', async ({ browser, page }) => {
    const test = new Screenshare(browser, page);
    await test.init(true, true);
    await test.startSharing();
  });
  
  test('Share screen unavailable on Mobile Android', async ({ browser }) => {
    const motoG4 = devices['Moto G4'];
    const context = await browser.newContext({ ...motoG4 });
    const page = await context.newPage();
    const test = new Screenshare(browser, page);
    await test.init(true, true);
    await test.testMobileDevice();
  });

  test('Share screen unavailable on Mobile iPhone', async ({ browser }) => {
    const iPhone11 = devices['iPhone 11'];
    const context = await browser.newContext({ ...iPhone11 });
    const page = await context.newPage();
    const test = new Screenshare(browser, page);
    await test.init(true, true);
    await test.testMobileDevice();
  });

  test('Share screen unavailable on Tablet iPad', async ({ browser }) => {
    const iPadPro11 = devices['iPad Pro 11'];
    const context = await browser.newContext({ ...iPadPro11 });
    const page = await context.newPage();
    const test = new Screenshare(browser, page);
    await test.init(true, true);
    await test.testMobileDevice();
  });
})