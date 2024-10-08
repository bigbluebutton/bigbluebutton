const { test } = require('../fixtures');
const { encodeCustomParams } = require('../parameters/util');
const { Presentation } = require('./presentation');
const { linkIssue } = require('../core/helpers');

const customStyleAvoidUploadingNotifications = encodeCustomParams(`userdata-bbb_custom_style=.presentationUploaderToast{display: none;}`);

test.describe.parallel('Presentation', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#navigation-automated
  test('Skip slide', { tag: '@ci' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  test('Share Camera As Content', { tag: '@ci' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.shareCameraAsContent();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#minimizerestore-presentation-automated
  test('Hide/Restore presentation', { tag: '@ci' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#start-youtube-video-sharing
  test('Start external video', { tag: [ '@ci', '@flaky' ] }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#fit-to-width-option
  test('Presentation fit to width', { tag: '@ci' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { createParameter: customStyleAvoidUploadingNotifications });
    await presentation.initUserPage(true, context);
    await presentation.fitToWidthTest();
  });

  test('Presentation fullscreen', { tag: '@ci' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.presentationFullscreen();
  });

  test('Presentation snapshot', { tag: '@ci' }, async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.presentationSnapshot(testInfo);
  });

  test('Hide Presentation Toolbar', { tag: ['@ci', '@flaky'] }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hidePresentationToolbar();
  });

  test('Zoom In, Zoom Out, Reset Zoom', { tag: ['@ci', '@flaky'] }, async ({ browser, context, page }) => {
    // @flaky: see https://github.com/bigbluebutton/bigbluebutton/issues/21266
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.zoom();
  });

  test('Select Slide', { tag: '@ci' }, async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.selectSlide();
  });

  test.describe.parallel('Manage', () => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#uploading-a-presentation-automated
    test('Upload single presentation', { tag: ['@ci', '@flaky'] }, async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadSinglePresentationTest();
    });

    test('Upload Other Presentations Format', { tag: ['@ci', '@flaky'] }, async ({ browser, context, page }) => {
      linkIssue(18971);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadOtherPresentationsFormat();
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#uploading-multiple-presentations-automated
    test('Upload multiple presentations', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadMultiplePresentationsTest();
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#enabling-and-disabling-presentation-download-automated
    test('Enable and disable original presentation download', { tag: '@ci' }, async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.enableAndDisablePresentationDownload(testInfo);
    });
    
    test('Send presentation in the current state (with annotations) to chat for downloading', { tag: '@ci' }, async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.sendPresentationToDownload(testInfo);
    });

    test('Remove all presentation', { tag: '@ci' }, async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.removeAllPresentation();
    });

    test('Upload and remove all presentations', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.uploadAndRemoveAllPresentations();
    });

    test('Remove previous presentation from previous presenter', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initModPage(page, true, { createParameter: customStyleAvoidUploadingNotifications });
      await presentation.initUserPage(true, context);
      await presentation.removePreviousPresentationFromPreviousPresenter();
    });
  });
});
