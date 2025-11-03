const { test } = require('../fixtures');
const { ConnectionStatus } = require('./connectionStatus');

test.describe.parallel('Connection Status', { tag: '@ci' } , () => {
  test('Open connection Status Modal', async ({ browser, context, page }, testInfo) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, true, { testInfo });
    await connectionStatus.connectionStatusModal();
  });

  test('Show network data in Connection Status', async ({ browser, context, page }, testInfo) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, true, { testInfo });
    await connectionStatus.usersConnectionStatus();
  });

  test('Report a User with bad connection in Connection Issues', { tag: '@need-update' }, async ({ browser, context, page }, testInfo) => {
    // The following test emulates a bad connection with a custom event
    // PR #19289 changed the way it's measured, not able to do so with a custom event anymore
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, true, { testInfo });
    await connectionStatus.reportUserInConnectionIssues();
  });

  test('Redirect to data saving settings when a bad connection is detected', { tag: '@need-update' }, async ({ browser, context, page }, testInfo) => {
    // The following test emulates a bad connection with a custom event
    // PR #19289 changed the way it's measured, not able to do so with a custom event anymore
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, true, { testInfo });
    await connectionStatus.linkToSettingsTest();
  });

  test('Copy stats', { tag: '@only-headed' }, async ({ browser, context, page }, testInfo) => {
    test.skip(testInfo.project.use.headless, 'Only works in headed mode');
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, true, { testInfo });
    await connectionStatus.copyStatsTest(context);
  });
});
