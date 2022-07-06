const { test } = require('@playwright/test');
const { Presentation } = require('./presentation');

test.describe.parallel('Presentation', () => {
  test('Skip slide @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  test('Hide/Restore presentation @ci', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  test('Start external video', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });

  test('Presentation fit to width', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.fitToWidthTest();
  });

  test.describe.parallel('Manage', () => {
    // https://docs.bigbluebutton.org/2.5/release-tests.html#uploading-a-presentation-automated
    test('Upload single presentation @ci', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
	await presentation.initPages(page, true);
      await presentation.uploadSinglePresentationTest();
    });

    // https://docs.bigbluebutton.org/2.5/release-tests.html#uploading-multiple-presentations-automated
    test('Upload multiple presentations', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page, true);
      await presentation.uploadMultiplePresentationsTest();
    });

    // https://docs.bigbluebutton.org/2.5/release-tests.html#enabling-and-disabling-presentation-download-automated
    test('Allow and disallow presentation download @ci', async ({ browser, context, page }, testInfo) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.allowAndDisallowDownload(testInfo);
    });

    test('Remove all presentation', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.removeAllPresentation();
    });
  });
});
