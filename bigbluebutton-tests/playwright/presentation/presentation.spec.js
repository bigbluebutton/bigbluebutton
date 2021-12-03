const { test } = require('@playwright/test');
const { Presentation } = require('./presentation');

test.describe.parallel('Presentation', () => {
  test('Skip slide', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.skipSlide();
  });

  test('Upload presentation', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.uploadPresentationTest();
  });

  test('Allow and disallow presentation download', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.allowAndDisallowDownload();
  });

  test('Remove all presentation', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.removeAllPresentation();
  });

  test('Hide/Restore presentation', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.hideAndRestorePresentation();
  });

  test('Start external video', async ({ browser, context, page }) => {
    const presentation = new Presentation(browser, context);
    await presentation.initPages(page);
    await presentation.startExternalVideo();
  });
});
