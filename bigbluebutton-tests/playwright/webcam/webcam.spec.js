const { test } = require('../fixtures');
const { MultiUsers } = require('../user/multiusers');
const { Webcam } = require('./webcam');

test.describe.parallel('Webcam', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#joining-webcam-automated
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

  test('Pinning and unpinning webcams', async ({ browser, context, page, browserName }) => {
    test.skip(browserName === 'firefox', 'It only works manually on Firefox');
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page);
    await webcam.initUserPage();
    await webcam.initModPage2();
    await webcam.pinningWebcams();
  });

  test('Change video quality', { tag: '@flaky' }, async ({ browser, page }) => {
    // Current approach is not reliable enough to ensure the video quality is changed
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.changeVideoQuality();
  });

  test('Webcam fullscreen', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.webcamFullscreen();
  });

  test('Disable Self-view', async ({ browser, page }) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true);
    await webcam.disableSelfView();
  });

  test('Focus and Unfocus webcam', async ({ browser, context, page }) => {
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page, true);
    await webcam.initUserPage();
    await webcam.initUserPage2();
    await webcam.focusUnfocusWebcam()
  });


  test.describe('Webcam background', () => {
    test('Select one of the default backgrounds', async ({ browser, page }) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true);
      await webcam.applyBackground();
    });

    // following test is throwing failures due to mis-comparison screenshot
    // as the emulated video is not static, we may add a mask in the middle part - where it moves the most
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
