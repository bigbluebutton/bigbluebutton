const { test } = require('@playwright/test');
const { Language } = require('./language');
const e = require('../core/elements');

test.describe.parallel('Settings test suite', () => {
  for(let locale of e.locales) {
    test.skip(`Test ${locale} locale`, async ({ browser, page }) => {
      console.log(browser);
      const language = new Language(browser, page);
      await language.init(true, true);
      await language.test(locale);
    });
  }
});
