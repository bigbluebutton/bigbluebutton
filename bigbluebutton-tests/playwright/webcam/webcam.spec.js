const { test } = require('@playwright/test');
const { Webcam } = require('./webcam');

test.describe.parallel('Webcam @ci', () => {
  test('Shares webcam', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.share();
  });

  test('Checks content of webcam', async ({ browser, page }) => {
    test.skip(true, 'the test is not as reliable as it should be: getting unexpected failures');
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.checksContent();
  });

  test('Checks webcam talking indicator', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, false);
    await webcam.talkingIndicator();
  });
});
