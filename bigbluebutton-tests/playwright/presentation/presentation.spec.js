const { test } = require('@playwright/test');
const { encodeCustomParams } = require('../customparameters/util');
const { Presentation } = require('./presentation');

const customStyleAvoidUploadingNotifications = encodeCustomParams(`userdata-bbb_custom_style=.presentationUploaderToast{display: none;}`);

test.describe.parallel('Presentation', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#navigation-automated
  test('Skip slide @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#minimizerestore-presentation-automated
  test('Hide/Restore presentation @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#start-youtube-video-sharing
  test('Start external video', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#fit-to-width-option
  test('Presentation fit to width', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, true, { customParameter: customStyleAvoidUploadingNotifications });
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
    await presentation.initPages(page);
    await presentation.hidePresentationToolbar();
  });

  test('Zoom In, Zoom Out, Reset Zoom', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.zoom();
  });

  test('Select Slide', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.selectSlide();
  });

  test.describe.parallel('Manage', () => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#uploading-a-presentation-automated
    test('Upload single presentation @ci', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadSinglePresentationTest();
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#uploading-multiple-presentations-automated
    test('Upload multiple presentations', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadMultiplePresentationsTest();
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#enabling-and-disabling-presentation-download-automated
    test('Send presentation to chat for downloading @ci', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.downloadPresentation(testInfo);
    });

    test('Remove all presentation', async ({ browser, context, page }) => {
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
      await presentation.initModPage(page, true, { customParameter: customStyleAvoidUploadingNotifications });
      await presentation.initUserPage(true, context);
      await presentation.removePreviousPresentationFromPreviousPresenter();
    });
  });
});
