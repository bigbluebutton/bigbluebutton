const { test } = require('@playwright/test');
const { Language } = require('./language');
const { About } = require('./about');

test.describe.parallel('Options', () => {
  test('Open about modal', async ({ browser, page }) => {
    const about = new About(browser, page);

    await about.init(true, true);
    await about.openedAboutModal();
  });
});

test.describe.parallel('Settings', () => {
  test(`Locales`, async ({ browser, page }) => {
    test.slow();
    const language = new Language(browser, page);
    await language.init(true, true);
    await language.test();
  });
});