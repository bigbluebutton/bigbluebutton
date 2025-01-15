const { test } = require('@playwright/test');
const { encodeCustomParams } = require('../parameters/util');
const { Presentation } = require('./presentation');

const customStyleAvoidNotificationToasts = encodeCustomParams(`userdata-bbb_custom_style=.presentationUploaderToast,.currentPresentationToast{display: none;}`);

test.describe.parallel('Presentation', () => {
  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#navigation-automated
  test('Skip slide @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  test('Share Camera As Content @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.shareCameraAsContent();
  });

  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#minimizerestore-presentation-automated
  test('Hide/Restore presentation @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#start-youtube-video-sharing
  test('Start external video @ci @flaky', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });

  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#fit-to-width-option
  test('Presentation fit to width @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { joinParameter: customStyleAvoidNotificationToasts });
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

  test('Hide Presentation Toolbar @ci', async ({ browser, context, page }) => {
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
    // https://docs.bigbluebutton.org/2.7/testing/release-testing/#uploading-a-presentation-automated
    test('Upload single presentation @ci', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadSinglePresentationTest();
    });

    test('Upload Other Presentations Format @ci @flaky', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadOtherPresentationsFormat();
    });

    // https://docs.bigbluebutton.org/2.7/testing/release-testing/#uploading-multiple-presentations-automated
    test('Upload multiple presentations', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadMultiplePresentationsTest();
    });

    // https://docs.bigbluebutton.org/2.7/testing/release-testing/#enabling-and-disabling-presentation-download-automated
    test('Enable and disable original presentation download @ci', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.enableAndDisablePresentationDownload(testInfo);
    });
    
    test('Send presentation in the current state (with annotations) to chat for downloading @ci', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.sendPresentationToDownload(testInfo);
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
      await presentation.initModPage(page, true, { joinParameter: customStyleAvoidNotificationToasts });
      await presentation.initUserPage(true, context);
      await presentation.removePreviousPresentationFromPreviousPresenter();
    });
  });
});
