import { test } from '../core/setup/fixtures';
import { InsertPages } from './insertPages';

test.describe.parallel('Insert pages by plugin command', { tag: '@ci' }, () => {
  // Ac-C 1
  test('Commands sent in a row are applied in order', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    insertPages.watchPageErrors(page);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.pluginCommandsInARow();
  });

  // Ac-C 2
  test('Uploads of commands sent in a row run in parallel', async ({ browser, context, page }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    insertPages.watchPageErrors(page);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.pluginCommandsUploadInParallel();
  });

  test('Warnings of commands sent in a row each get a toast of their own', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const insertPages = new InsertPages(browser, context);
    insertPages.watchPageErrors(page);
    await insertPages.initModPage(page, { testInfo });
    await insertPages.pluginWarningsInARow();
  });

  test.describe('Breakout rooms', () => {
    const overrides = { public: { app: { breakouts: { allowPresentationManagementInBreakouts: false } } } };

    // settings.yml ships allowPresentationManagementInBreakouts: true
    test('Insert command applied for the room presenter by default', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.initUserPage(context, { testInfo });
      await insertPages.pluginInsertInBreakoutRoom(true);
    });

    test('Insert command ignored for the room presenter when allowPresentationManagementInBreakouts is false', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.initModPage(page, { testInfo, clientSettingsOverrides: overrides });
      await insertPages.initUserPage(context, { testInfo });
      await insertPages.pluginInsertInBreakoutRoom(false, overrides);
    });

    test('Upload command applied for the room presenter by default', async ({ browser, context, page }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.initModPage(page, { testInfo });
      await insertPages.initUserPage(context, { testInfo });
      await insertPages.pluginUploadInBreakoutRoom(true);
    });

    test('Upload command ignored for the room presenter when allowPresentationManagementInBreakouts is false', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const insertPages = new InsertPages(browser, context);
      await insertPages.initModPage(page, { testInfo, clientSettingsOverrides: overrides });
      await insertPages.initUserPage(context, { testInfo });
      await insertPages.pluginUploadInBreakoutRoom(false, overrides);
    });
  });
});
