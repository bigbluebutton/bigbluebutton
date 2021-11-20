const { test } = require('@playwright/test');
const { Language } = require('./language');
const elements = require('../elements');

test.describe.parallel('Settings test suite', () => {
  for(let locale of elements.locales) {
    test.skip(`Test ${locale} locale`, async ({ browser, page }) => {
      console.log(browser);
      const language = new Language(browser, page);
      await language.init(true, true);
      await language.test(locale);
    });
  }
});
