import { test } from '../core/setup/fixtures';
import { ConnectionStatus } from './connectionStatus';
import { watchHeartbeatFrames } from './util';

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

// The server flags an unresponsive client from this heartbeat (clientNotResponding), so it has to keep running
// with the connection status UI disabled and with the navigation bar hidden. The overrides apply in the page only:
// the shorter interval speeds the checks up while the server keeps judging with its own settings.
test.describe.parallel('Connection Status heartbeat', { tag: '@nightly' }, () => {
  test('Heartbeat is sent while the connection status UI is disabled', async ({ browser, context, page }, testInfo) => {
    const heartbeats = watchHeartbeatFrames(page);
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, {
      testInfo,
      clientSettingsOverrides: { public: { stats: { enabled: false, interval: 1000 } } },
    });
    await connectionStatus.heartbeatWithoutConnectionStatusUi(heartbeats);
  });

  test('Heartbeat is sent while the navigation bar is hidden', async ({ browser, context, page }, testInfo) => {
    const heartbeats = watchHeartbeatFrames(page);
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, {
      testInfo,
      joinParameter: 'userdata-bbb_hide_nav_bar=true',
      clientSettingsOverrides: { public: { stats: { interval: 1000 } } },
    });
    await connectionStatus.heartbeatWithHiddenNavBar(heartbeats);
  });
});
