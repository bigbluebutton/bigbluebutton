const { test } = require('@playwright/test');
const { Language } = require('./language');

test.describe.parallel('Settings', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#application-settings
  test(`Locales`, async ({ browser, page }) => {
    test.slow();
    const language = new Language(browser, page);
    await language.init(true, true);
    await language.test();
  });
});
