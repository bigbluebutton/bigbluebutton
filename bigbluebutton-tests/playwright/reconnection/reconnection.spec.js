const { test } = require('@playwright/test');
const { Reconnection } = require('./reconnection');

test.describe.serial('Reconnection', () => {
  test('Chat', async ({ browser, context, page }) => {
    const reconnection = new Reconnection(browser, context);
    await reconnection.checkRootPermission(); // check sudo permission before starting test
    await reconnection.initModPage(page);
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }) => {
    const reconnection = new Reconnection(browser, context);
    await reconnection.checkRootPermission(); // check sudo permission before starting test
    await reconnection.initModPage(page);
    await reconnection.microphone();
  });
});
