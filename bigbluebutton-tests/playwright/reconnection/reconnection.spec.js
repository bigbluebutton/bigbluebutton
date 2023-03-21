const { test } = require('@playwright/test');
const e = require('../core/elements');
const notificationsUtil = require('../notifications/util');
const { expect } = require('@playwright/test');
const { Reconnection } = require('./reconnection');

test.describe.parallel('Reconnection', () => {
  test('Chat', async ({ browser, context, page }) => {
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page);
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }) => {
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page);
    await reconnection.mute();
  });
});
