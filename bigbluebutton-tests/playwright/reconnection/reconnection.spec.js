const { test } = require('@playwright/test');
const { Reconnection } = require('./reconnection');
const { checkRootPermission } = require('../core/helpers');

test.describe.serial('Reconnection', () => {
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
