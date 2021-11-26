const { test } = require('@playwright/test');
const Presentation = require('./presentation');

test.describe.parallel('Presentation', () => {
  test('Skip slide', async ({ browser, context, page }) => {
    const test = new Presentation(browser, context);
    await test.initPages(page);
    await test.skipSlide();
  });

  test('Upload presentation', async ({ browser, context, page }) => {
    const test = new Presentation(browser, context);
    await test.initPages(page);
    await test.uploadPresentation();
  });

  test('Allow and disallow presentation download', async ({ browser, context, page }) => {
    const test = new Presentation(browser, context);
    await test.initPages(page);
    await test.allowAndDisallowDownload();
  });

  test('Remove all presentation', async ({ browser, context, page }) => {
    const test = new Presentation(browser, context);
    await test.initPages(page);
    await test.removeAllPresentation();
  });

  test('Hide/Restore presentation', async ({ browser, context, page }) => {
    const test = new Presentation(browser, context);
    await test.initPages(page);
    await test.hideAndRestorePresentation();
  });

  test('Start external video', async ({ browser, context, page }) => {
    const test = new Presentation(browser, context);
    await test.initPages(page);
    await test.startExternalVideo();
  });
});