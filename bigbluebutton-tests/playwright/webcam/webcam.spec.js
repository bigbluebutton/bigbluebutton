const { test } = require('@playwright/test');
const Webcam = require('./webcam');

test.describe.parallel('Webcam', () => {
  test('Shares webcam', async ({ browser, context, page }) => {
    const test = new Webcam(browser, page);
    await test.init(true, true);
    await test.share();
  });

  test('Checks content of webcam', async ({ browser, context, page }) => {
    const test = new Webcam(browser, page);
    await test.init(true, true);
    await test.checksContent();
  });

  test('Checks webcam talking indicator', async ({ browser, context, page }) => {
    const test = new Webcam(browser, page);
    await test.init(true, false);
    await test.talkingIndicator();
  });
});