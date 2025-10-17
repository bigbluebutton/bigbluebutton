const { test } = require('../fixtures');
const { Reconnection } = require('./reconnection');
const { checkRootPermission } = require('../core/helpers');

test.describe.parallel('Reconnection', () => {
  test('Chat', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, true, { testInfo });
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, true, { testInfo });
    await reconnection.microphone();
  });
});
