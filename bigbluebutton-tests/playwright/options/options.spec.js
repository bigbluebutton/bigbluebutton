const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { Options } = require('./options');
const { initializePages } = require('../core/helpers');

test.describe('Options', { tag: '@ci' }, () => {
  const options = new Options();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(options, browser);
  });

  test('Open about modal', async () => {
    await options.openedAboutModal();
  });

  test('Open Help Button', async () => {
    await options.openHelp();
  });

  test('Locales', { tag: '@flaky' }, async () => {
    // not applying the correct locale for some main elements
    await options.localesTest();
  });

  test('Dark mode', async () => {
    await options.darkMode();
  });

  test('Font size', async () => {
    await options.fontSizeTest();
  });
});
