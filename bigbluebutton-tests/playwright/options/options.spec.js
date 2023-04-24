const { test } = require('@playwright/test');
const { Options } = require('./options');

test.describe.serial('Options', () => {
  const options = new Options();
  test.beforeAll(async({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await options.initModPage(page, true);
  })

  test('Open about modal', async () => {
    await options.openedAboutModal();
  });

  test('Open Help Button', async () => {
    await options.openHelp();
  });
/*
  test('Open Help Button', async ({ browser, page, context }) => {
    const helpButton = new Options(browser, page);
    await helpButton.init(true, true);
    await helpButton.openHelp(context);
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#application-settings
  test(`Locales`, async ({ browser, page }) => {
    test.slow();
    const language = new Options(browser, page);
    await language.init(true, true);
    await language.localesTest();
  });

  test('Dark mode', async ({ browser, page }) => {
    const darkModeTest = new Options(browser, page);
    await darkModeTest.init(true, true);
    await darkModeTest.darkMode();
  });

  test('Font size', async ({ browser, page }) => {
    const fontSize = new Options(browser, page);
    await fontSize.init(true, true);
    await fontSize.fontSizeTest();
  });
  */
});


/*
test.describe.parallel('Settings', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#application-settings
  test(`Locales`, async ({ browser, page }) => {
    test.slow();
    const language = new Options(browser, page);
    await language.init(true, true);
    await language.localesTest();
  });

  test('Dark mode', async ({ browser, page }) => {
    const darkModeTest = new Options(browser, page);
    await darkModeTest.init(true, true);
    await darkModeTest.darkMode();
  });

  test('Font size', async ({ browser, page }) => {
    const fontSize = new Options(browser, page);
    await fontSize.init(true, true);
    await fontSize.fontSizeTest();
  });
});
*/
