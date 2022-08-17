const { test } = require('@playwright/test');
const { Language } = require('./language');

test.describe.parallel('Settings test suite', () => {
    test(`Test locales`, async ({ browser, page }) => {
      test.slow();
      const language = new Language(browser, page);
      await language.init(true, true);
      await language.test();
    });
});
