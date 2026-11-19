import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { InsertPages } from './insertPages';

test.describe.parallel('Insert pages', { tag: '@ci' }, () => {
  // Ac-B 1
  test('Blank page keeps the annotations and the zoom of every page', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initPages(page, testInfo);
    await insertPages.blankPageKeepsAnnotationsAndZoom();
  });

  // Ac-B 2
  test('Pages of a PDF with a 16:9 page in a 4:3 deck', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.insertPdfWithMixedRatios();
  });

  // Ac-B 3
  test('No insert pages button when the feature is disabled', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, {
      testInfo,
      clientSettingsOverrides: { public: { presentation: { insertPagesEnabled: false } } },
    });
    await insertPages.buttonAbsentWhenDisabled();
  });

  // Ac-B 4
  test('Slide change while the upload is held', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.slideChangeWhileUploadHeld();
  });

  // Ac-B 4
  test('Presentation change while the upload is held', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.presentationChangeWhileUploadHeld();
  });

  // Ac-B 5
  test('Empty file, then a blank page', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.refusedFileThenBlankPage(e.insertEmptyFileName, e.insertPagesFailedLabel);
  });

  // Ac-B 5
  test('Truncated PDF, then a blank page', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.refusedFileThenBlankPage(e.insertTruncatedFileName, e.insertPagesFailedLabel);
  });

  // Ac-B 6
  test('Button disabled until the upload ends', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.buttonDisabledUntilUploadEnds();
  });

  // Ac-B 7
  test('Two blank pages in a row', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.twoBlankPagesInARow();
  });

  // Ac-B 8
  test('Upload toast of an insert, presentation list and export toast', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initPages(page, testInfo);
    await insertPages.uploadToastAndExportToast();
  });

  // Ac-B 9
  test('Queue order across a presenter change', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.initModPage2(context, { testInfo });
    await insertPages.queueOrderAcrossPresenters();
  });

  // Ac-B 10
  test('Blank page after a portrait A4 page with a fractional size', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.blankPageSizeFollowsReference(e.insertPortraitA4FileName);
  });

  // Ac-B 10
  test('Blank page after a square page', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.blankPageSizeFollowsReference(e.insertSquareFileName);
  });

  // Ac-B 21
  test.describe('Client service', () => {
    test('Token request without answer', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.routeGraphqlSocket(page);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.tokenRequestWithoutAnswer();
    });

    test('Token request refused for an image presentation', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.tokenRefusedForImageTarget();
    });

    test('Blank page mutation with an error', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.routeGraphqlSocket(page);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.blankPageMutationFails('error');
    });

    test('Blank page mutation without answer', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.routeGraphqlSocket(page);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.blankPageMutationFails('drop');
    });

    test('Blank page mutation answered late', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.routeGraphqlSocket(page);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.blankPageMutationAnsweredLate();
    });

    test('File over the maximum size', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.routeGraphqlSocket(page);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.fileTooLarge();
    });

    // waits for the 30 s request deadline of the server
    test('Upload POST that fails', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      insertPages.watchPageErrors(page);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.uploadPostFails();
    });
  });

  // Ac-B 44
  test('Screen reader alert when another presentation is shown', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.alertOnPresentationChange();
  });
});
