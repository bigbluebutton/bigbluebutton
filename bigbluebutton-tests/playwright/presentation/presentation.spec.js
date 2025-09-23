const { test } = require('../fixtures');
const { encodeCustomParams } = require('../parameters/util');
const { Presentation } = require('./presentation');
const { linkIssue } = require('../core/helpers');

test.describe.parallel('Presentation', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#navigation-automated
  test('Skip slide', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.skipSlide();
  });

  test('Share Camera As Content', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.shareCameraAsContent();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#minimizerestore-presentation-automated
  test('Hide/Restore presentation', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.hideAndRestorePresentation();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#start-youtube-video-sharing
  test('Start external video', { tag: '@flaky' }, async ({ browser, context, page }, testInfo) => {
    // requiring logged user to start external video on CI environment
    linkIssue(21589);
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.startExternalVideo();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#fit-to-width-option
  test('Presentation fit to width', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { testInfo });
    await presentation.initUserPage(true, context, { testInfo });
    await presentation.fitToWidthTest();
  });

  test('Presentation fullscreen', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.presentationFullscreen();
  });

  test('Presentation snapshot', async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox does not support download.')
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.presentationSnapshot();
  });

  test('Hide Presentation Toolbar', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { testInfo });
    await presentation.initUserPage(true, context, { testInfo });
    await presentation.hidePresentationToolbar();
  });

  test('Zoom In, Zoom Out, Reset Zoom', { tag: '@flaky' }, async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.zoom();
  });

  test('Select Slide', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.selectSlide();
  });

  test.describe.parallel('Manage', () => {
    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#uploading-a-presentation-automated
    test('Upload single presentation', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.uploadSinglePresentationTest();
    });

    test('Upload Other Presentations Format', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.uploadOtherPresentationsFormat();
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#uploading-multiple-presentations-automated
    test('Upload multiple presentations', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.uploadMultiplePresentationsTest();
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#enabling-and-disabling-presentation-download-automated
    test('Enable and disable original presentation download', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.enableAndDisablePresentationDownload(testInfo);
    });

    test('Send presentation in the current state (with annotations) to chat for downloading', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.sendPresentationToDownload(testInfo);
    });

    test('Remove all presentations', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.removeAllPresentation();
    });

    test('Upload and remove all presentations', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.uploadAndRemoveAllPresentations();
    });

    test('Remove previous presentation from previous presenter', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initModPage(page, true, { testInfo });
      await presentation.initUserPage(true, context, { testInfo });
      await presentation.removePreviousPresentationFromPreviousPresenter();
    });
  });
});
