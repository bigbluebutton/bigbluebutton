const { test } = require('../fixtures');
const { Options } = require('./options');
const { initializePages } = require('../core/helpers');

test.describe.parallel('Options', { tag: '@ci' }, () => {
  const options = new Options();

  test.beforeEach(async ({ browser }) => {
    await initializePages(options, browser);
  });

  test('Open about modal', async () => {
    await options.openedAboutModal();
  });

  test('Open Help Button', async () => {
    await options.openHelp();
  });

  test('Locales', async () => {
    await options.localesTest();
  });

  test('Dark mode', async () => {
    await options.darkMode();
  });

  test('Font size', async () => {
    await options.fontSizeTest();
  });
});
