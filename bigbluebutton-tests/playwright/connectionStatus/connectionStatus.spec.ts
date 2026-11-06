import { test } from '../core/setup/fixtures';
import { ConnectionStatus } from './connectionStatus';

test.describe.parallel('Connection Status', { tag: '@ci' }, () => {
  test('Open connection Status Modal', async ({ browser, context, page }, testInfo) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.connectionStatusModal();
  });

  test('Show network data in Connection Status', async ({ browser, context, page }, testInfo) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.usersConnectionStatus();
  });

  test('Report a User with bad connection in Connection Issues', async ({ browser, context, page }, testInfo) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.reportUserInConnectionIssues();
  });

  test('Redirect to data saving settings when a bad connection is detected', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.linkToSettingsTest();
  });

  test('Copy stats', async ({ browser, browserName, context, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.copyStatsTest();
  });
});
