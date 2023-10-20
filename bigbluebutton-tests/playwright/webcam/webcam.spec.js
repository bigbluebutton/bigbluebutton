const { test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const { Webcam } = require('./webcam');

test.describe.parallel('Webcam', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#joining-webcam-automated
  test('Shares webcam @ci', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.share();
  });

  test('Checks content of webcam', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.checksContent();
  });

  test('Webcam talking indicator @ci', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, false);
    await webcam.talkingIndicator();
  });

  test('Pinning and unpinning webcams @ci', async ({ browser, context, page }) => {
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
    /* this test has the flaky tag because it is breaking due to a default video from chrome that
    is overlapping the virtual background. */
    test('Select one of the default backgrounds @ci @flaky', async ({ browser, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.applyBackground();
    });

    // following test is throwing failures due to mis-comparison screenshot
    // as the emulated video is not static, we may add a mask in the middle part - where it moves the most
    test('Managing new background @flaky', async ({ browser, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.managingNewBackground();
    });

    test('Keep background when rejoin @ci', async ({ browser, context, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.keepBackgroundWhenRejoin(context);
    });
  });
});
