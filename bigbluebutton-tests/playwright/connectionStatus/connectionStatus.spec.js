const { test } = require('@playwright/test');
const { ConnectionStatus } = require('./connectionStatus');

test.describe.parallel('Connection Status', () => {
  test('Open connection Status Modal', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.connectionStatusModal();
  });

  test('Show network data in Connection Status', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.usersConnectionStatus();
  });

  test('Report a User with bad connection in Connection Issues', async ({ browser, context, page }) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page);
    await connectionStatus.reportUserInConnectionIssues();
  });
});
