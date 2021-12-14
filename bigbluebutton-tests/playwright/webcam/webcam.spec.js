const { test } = require('@playwright/test');
const { Webcam } = require('./webcam');

test.describe.parallel('Webcam', () => {
  test('Shares webcam', async ({ browser, context, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.share();
  });

  test('Checks content of webcam', async ({ browser, context, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.checksContent();
  });

  test('Checks webcam talking indicator', async ({ browser, context, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, false);
    await webcam.talkingIndicator();
  });
});
