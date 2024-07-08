const { test } = require('../fixtures');
const { ConnectionStatus } = require('./connectionStatus');

test.describe.parallel('Connection Status', () => {
  test('Open connection Status Modal @ci', async ({ browser, browserName, context, page }) => {
    test.skip(browserName === 'firefox', 'Test not working on firefox, audio breaks.');
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.connectionStatusModal();
  });

  test('Show network data in Connection Status @ci', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.usersConnectionStatus();
  });

  test('Report a User with bad connection in Connection Issues @ci @flaky', async ({ browser, context, page }) => {
    // The following test emulates a bad connection with a custom event
    // PR #19289 changed the way it's measured, not able to do so with a custom event anymore
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.reportUserInConnectionIssues();
  });

  test('Redirect to data saving settings when a bad connection is detected @ci @flaky', async ({ browser, context, page }) => {
    // The following test emulates a bad connection with a custom event
    // PR #19289 changed the way it's measured, not able to do so with a custom event anymore
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.linkToSettingsTest();
  });

  test('Copy stats', async ({ browser, context, page }, testInfo) => {
    test.fixme(testInfo.project.use.headless, 'Only works in headed mode');
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.copyStatsTest(context);
  });
});
