const { test } = require('@playwright/test');
const { fullyParallel } = require('../playwright.config');
const { Reconnection } = require('./reconnection');
const { checkRootPermission } = require('../core/helpers');

if (!fullyParallel) test.describe.configure({ mode: 'serial' });

test.describe('Reconnection', () => {
  test('Chat', async ({ browser, context, page }) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page);
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page);
    await reconnection.microphone();
  });
});
