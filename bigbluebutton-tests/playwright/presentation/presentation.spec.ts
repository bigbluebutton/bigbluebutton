import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Presentation } from './presentation';

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

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#fit-to-width-option
  test('Presentation fit to width', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, { testInfo });
    await presentation.initUserPage(context, { testInfo });
    await presentation.fitToWidthTest();
  });

  test('Presentation fullscreen', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.presentationFullscreen();
  });

  test('Presentation snapshot', async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox does not support download.');
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.presentationSnapshot();
  });

  test('Hide Presentation Toolbar', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initModPage(page, { testInfo });
    await presentation.initUserPage(context, { testInfo });
    await presentation.hidePresentationToolbar();
  });

  test('Zoom In, Zoom Out, Reset Zoom', async ({ browser, context, page }, testInfo) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.zoom();
  });

  test('Select Slide', { tag: '@flaky-3.1' }, async ({ browser, context, page }, testInfo) => {
    linkIssue(24367);
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page, testInfo);
    await presentation.selectSlide();
  });

  // All external video tests (youtube) require logged user to start external video on CI environment
  test.describe.parallel('External Video', { tag: '@flaky' }, () => {
    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#start-youtube-video-sharing
    test('Start external video', async ({ browser, context, page }, testInfo) => {
      linkIssue(21589);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.startExternalVideo();
    });

    test('External video loads correctly after new user joins the meeting', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.startExternalVideo();
      await presentation.initUserPage2(context, { testInfo });
      await presentation.checkVideoAfterUserJoins();
    });

    test('Pause External video', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.startExternalVideo();
      await presentation.pauseExternalVideo();
    });

    test('Change presenter while playing external video', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.startExternalVideo();
      await presentation.changePresenterWhileVideoPlaying();
    });

    test('End External video', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.startExternalVideo();
      await presentation.endExternalVideo();
    });
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
      await presentation.enableAndDisablePresentationDownload();
    });

    test('Send presentation in the current state (with annotations) to chat for downloading', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.sendPresentationToDownload();
    });

    test('Remove all presentations', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.removeAllPresentation();
    });

    test('Upload and remove all presentations', { tag: '@flaky' }, async ({ browser, context, page }, testInfo) => {
      // duplicate toast notification displayed
      linkIssue(24056);
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, testInfo);
      await presentation.uploadAndRemoveAllPresentations();
    });

    test('Remove previous presentation from previous presenter', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initModPage(page, { testInfo });
      await presentation.initUserPage(context, { testInfo });
      await presentation.removePreviousPresentationFromPreviousPresenter();
    });
  });
});
