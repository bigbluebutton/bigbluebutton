const { test } = require('../fixtures');
const { encodeCustomParams } = require('../parameters/util');
const { Presentation } = require('./presentation');
const { linkIssue } = require('../core/helpers');

const customStyleAvoidUploadingNotifications = encodeCustomParams(`userdata-bbb_custom_style=.presentationUploaderToast{display: none;}`);

test.describe.parallel('Presentation', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#navigation-automated
  test('Skip slide @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  test('Share Camera As Content @ci', async ({ browser, browserName, context, page }) => {
    test.skip(browserName === 'firefox', 'Video for simulating webcam not working on firefox.')
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.shareCameraAsContent();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#minimizerestore-presentation-automated
  test('Hide/Restore presentation @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#start-youtube-video-sharing
  test('Start external video @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#fit-to-width-option
  test('Presentation fit to width @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { createParameter: customStyleAvoidUploadingNotifications });
    await presentation.initUserPage(true, context);
    await presentation.fitToWidthTest();
  });

  test('Presentation fullscreen @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.presentationFullscreen();
  });

  test('Presentation snapshot @ci', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.presentationSnapshot(testInfo);
  });

  test('Hide Presentation Toolbar @ci @flaky', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hidePresentationToolbar();
  });

  test('Zoom In, Zoom Out, Reset Zoom @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.zoom();
  });

  test('Select Slide @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.selectSlide();
  });

  test.describe.parallel('Manage', () => {
    test('Upload single presentation @ci @flaky', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadSinglePresentationTest();
    });

    test('Upload Other Presentations Format @ci @flaky', async ({ browser, context, page }) => {
      linkIssue(18971);
      test.skip(browserName === 'firefox', 'Inconsistent screenshot PPTX');
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
    test('Enable and disable original presentation download @ci', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.enableAndDisablePresentationDownload(testInfo);
    });
    
    test('Send presentation in the current state (with annotations) to chat for downloading @ci', async ({ browser, context, page, browserName }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.sendPresentationToDownload(testInfo, browserName);
    });

    test('Remove all presentation @ci', async ({ browser, context, page }) => {
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
