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
});
