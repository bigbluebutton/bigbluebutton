const { test } = require('../fixtures');
const { Reconnection } = require('./reconnection');
const { checkRootPermission } = require('../core/helpers');

test.describe.parallel('Reconnection', { tag: '@flaky' }, () => {
  // @ci Note: both tests are failing due to "server closed connection" bug
  // see issue https://github.com/bigbluebutton/bigbluebutton/issues/21147

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
