const { test } = require('@playwright/test');
const { Options } = require('./options');

test.describe.parallel('Options', () => {
  test('Open about modal', async ({ browser, page }) => {
    const about = new Options(browser, page);
    await about.init(true, true);
    await about.openedAboutModal();
  });
});

test.describe.parallel('Settings', () => {
  test(`Locales`, async ({ browser, page }) => {
    test.slow();
    const language = new Options(browser, page);
    await language.init(true, true);
    await language.localesTest();
  });
});