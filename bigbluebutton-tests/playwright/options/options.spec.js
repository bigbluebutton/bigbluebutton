const { test } = require('@playwright/test');
const { fullyParallel } = require('../playwright.config');
const { Options } = require('./options');
const { initializePages } = require('../core/helpers');

test.describe('Options', () => {
  const options = new Options();
  let context;

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    const { context: innerContext } = await initializePages(options, browser);
    context = innerContext;
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
