const { test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const { Webcam } = require('./webcam');

test.describe.parallel('Webcam @ci', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#joining-webcam-automated
  test('Shares webcam', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.share();
  });

  test('Checks content of webcam', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.checksContent();
  });

  test('Webcam talking indicator', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, false);
    await webcam.talkingIndicator();
  });

  test('Pinning and unpinning webcams', async ({ browser, context, page }) => {
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page);
    await webcam.initUserPage();
    await webcam.initModPage2();
    await webcam.pinningWebcams();
  });

  test('Change video quality', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.changeVideoQuality();
  });

  test('Webcam fullscreen', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.webcamFullscreen();
  });

  test.describe('Webcam background', () => {
    test('Select one of the default backgrounds', async ({ browser, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.applyBackground();
    });

    test('Managing new background', async ({ browser, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.managingNewBackground();
    });

    test('Keep background when rejoin', async ({ browser, context, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.keepBackgroundWhenRejoin(context);
    });
  });
});
