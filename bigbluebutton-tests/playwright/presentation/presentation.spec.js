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

  test.describe.parallel('Manage', () => {
    test('Upload presentation @ci', async ({ browser, context, page }) => {
      const presentation = new Presentation(browser, context);
      await presentation.initPages(page);
      await presentation.uploadPresentationTest();
    });

    test.skip('Allow and disallow presentation download @ci', async ({ browser, context, page }, testInfo) => {
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
