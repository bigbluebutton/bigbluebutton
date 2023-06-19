const { test } = require('@playwright/test');
const { Options } = require('./options');

test.describe.serial('Options', () => {
  const options = new Options();
  let context;
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    const page = await context.newPage();
    await options.initModPage(page, true);
  });

  test('Open about modal', async () => {
    await options.openedAboutModal();
  });

  test('Open Help Button', async () => {
    await options.openHelp(context);
  });

  test('Locales test', async () => {
    await options.localesTest();
  });

  test('Dark mode @ci', async () => {
    await options.darkMode();
  });

  test('Font size @ci', async () => {
    await options.fontSizeTest();
  });
});
