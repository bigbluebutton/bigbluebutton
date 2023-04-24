const { test } = require('@playwright/test');
const { Options } = require('./options');

test.describe.serial('Options', () => {
  const options = new Options();
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await options.initModPage(page, true);
    await options.handleHelpPage(context);
  });

  test('Open about modal', async () => {
    await options.openedAboutModal();
  });

  test('Open Help Button', async () => {
    await options.openHelp();
  });

  test('Locales test', async () => {
    await options.localesTest();
  });

  test('Dark mode', async () => {
    await options.darkMode();
  });

  test('Font size', async () => {
    await options.fontSizeTest();
  });
});
