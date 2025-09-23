const { test } = require('../fixtures');
const { MultiUsers } = require('../user/multiusers');
const { Webcam } = require('./webcam');

test.describe.parallel('Webcam', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#joining-webcam-automated
  test('Shares webcam', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true, { testInfo });
    await webcam.share();
  });

  test('Checks content of webcam', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true, { testInfo });
    await webcam.checksContent();
  });

  test('Webcam talking indicator', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, false, { testInfo });
    await webcam.talkingIndicator();
  });

  test('Mirror webcam', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true, { testInfo });
    await webcam.mirrorWebcam();
  });

  test('Pinning and unpinning webcams', async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'It only works manually on Firefox');
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page, true, { testInfo });
    await webcam.initUserPage(true, context, { testInfo });
    await webcam.initModPage2(true, context, { testInfo });
    await webcam.pinningWebcams();
  });

  test('Change video quality', { tag: '@flaky' }, async ({ browser, page }, testInfo) => {
    // Current approach is not reliable enough to ensure the video quality is changed
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true, { testInfo });
    await webcam.changeVideoQuality();
  });

  test('Webcam fullscreen', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true, { testInfo });
    await webcam.webcamFullscreen();
  });

  test('Disable Self-view', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, true, { testInfo });
    await webcam.disableSelfView();
  });

  test('Focus and Unfocus webcam', async ({ browser, context, page }, testInfo) => {
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page, true, { testInfo });
    await webcam.initUserPage(true, context, { testInfo });
    await webcam.initUserPage2(true, context, { testInfo });
    await webcam.focusUnfocusWebcam();
  });

  test.describe('Webcam background', () => {
    test('Select one of the default backgrounds', async ({ browser, page }, testInfo) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true, { testInfo });
      await webcam.applyBackground();
    });

    // following test is throwing failures due to mis-comparison screenshot
    // as the emulated video is not static, we may add a mask in the middle part - where it moves the most
    test('Managing new background', async ({ browser, page }, testInfo) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true, { testInfo });
      await webcam.managingNewBackground();
    });

    test('Keep background when rejoin', async ({ browser, context, page }, testInfo) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, true, { testInfo });
      await webcam.keepBackgroundWhenRejoin(context);
    });
  });
});
