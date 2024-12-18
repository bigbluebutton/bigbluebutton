const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { Options } = require('./options');
const { initializePages } = require('../core/helpers');
const { encodeCustomParams } = require('../parameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

test.describe('Options', () => {
  const options = new Options();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(options, browser, { joinParameter: hidePresentationToast });
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

  test('Dark mode', { tag: ['@ci', '@flaky'] }, async () => {
    await options.darkMode();
  });

  test('Font size', { tag: ['@ci', '@flaky'] }, async () => {
    await options.fontSizeTest();
  });
});
