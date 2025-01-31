const { test } = require('../fixtures');
const { encodeCustomParams } = require('../parameters/util');
const { Presentation } = require('./presentation');
const { linkIssue } = require('../core/helpers');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

test.describe.parallel('Presentation', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#navigation-automated
  test('Skip slide', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  test('Share Camera As Content', { tag: '@flaky-3.1' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.shareCameraAsContent();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#minimizerestore-presentation-automated
  test('Hide/Restore presentation', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#start-youtube-video-sharing
  test('Start external video', { tag: '@flaky' }, async ({ browser, context, page }) => {
    // requiring logged user to start external video on CI environment
    linkIssue(21589);
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#fit-to-width-option
  test('Presentation fit to width', { tag: '@flaky-3.1' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { joinParameter: hidePresentationToast });
    await presentation.initUserPage(true, context);
    await presentation.fitToWidthTest();
  });

  test('Presentation fullscreen', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.presentationFullscreen();
  });

  test('Presentation snapshot', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.presentationSnapshot(testInfo);
  });

  test('Hide Presentation Toolbar', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { joinParameter: hidePresentationToast });
    await presentation.initUserPage(page, context, { joinParameter: hidePresentationToast });
    await presentation.hidePresentationToolbar();
  });

  test('Zoom In, Zoom Out, Reset Zoom', { tag: '@flaky' }, async ({ browser, context, page }) => {
    // Oct, 24 => Recent failures in CI runs. doesn't seem to be reproducible locally
    // see issue below
    linkIssue(21266);
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.zoom();
  });

  test('Select Slide', { tag: '@flaky-3.1' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.selectSlide();
  });

  test.describe.parallel('Manage', () => {
    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#uploading-a-presentation-automated
    test('Upload single presentation', { tag: '@flaky' }, async ({ browser, context, page }) => {
      // current presentation toast not being displayed sometimes
      linkIssue(21813);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadSinglePresentationTest();
    });

    test('Upload Other Presentations Format', { tag: '@flaky' }, async ({ browser, context, page }) => {
      // file with wrong (not expected) ideogram conversion pushed, which is used for assertions
      linkIssue(18971);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadOtherPresentationsFormat();
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#uploading-multiple-presentations-automated
    test('Upload multiple presentations', { tag: '@flaky' }, async ({ browser, context, page }) => {
      // current presentation toast not being displayed sometimes
      linkIssue(21813);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadMultiplePresentationsTest();
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#enabling-and-disabling-presentation-download-automated
    test('Enable and disable original presentation download', { tag: '@flaky-3.1' }, async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.enableAndDisablePresentationDownload(testInfo);
    });
    
    test('Send presentation in the current state (with annotations) to chat for downloading', { tag: '@flaky-3.1' }, async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.sendPresentationToDownload(testInfo);
    });

    test('Remove all presentations', { tag: '@flaky-3.1' }, async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.removeAllPresentation();
    });

    test('Upload and remove all presentations', { tag: '@flaky' }, async ({ browser, context, page }) => {
      // sometimes the uploaded presentation is not displayed in the manage presentations modal
      linkIssue(21624);
      // current presentation toast not being displayed sometimes
      linkIssue(21813);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.uploadAndRemoveAllPresentations();
    });

    test('Remove previous presentation from previous presenter', { tag: '@flaky' }, async ({ browser, context, page }) => {
      // current presentation toast not being displayed sometimes
      linkIssue(21813);
      const presentation = new Presentation(browser, context);
      await presentation.initModPage(page, true);
      await presentation.initUserPage(true, context);
      await presentation.removePreviousPresentationFromPreviousPresenter();
    });
  });
});
