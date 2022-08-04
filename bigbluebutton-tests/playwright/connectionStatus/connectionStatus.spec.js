const { test } = require('@playwright/test');
const { ConnectionStatus } = require('./connectionStatus');

test.describe.parallel('Connection Status', () => {
  test('Open connection Status Modal @ci', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.connectionStatusModal();
  });

  test('Show network data in Connection Status @ci', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.usersConnectionStatus();
  });

  test('Report a User with bad connection in Connection Issues @ci', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.reportUserInConnectionIssues();
  });

  test('Go to settings modal', async ({ browser, context, page }) => {
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
