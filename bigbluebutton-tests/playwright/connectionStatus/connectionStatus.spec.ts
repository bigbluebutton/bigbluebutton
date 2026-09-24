import { expect } from '@playwright/test';
import { test } from '../core/setup/fixtures';
import { elements as e } from '../core/elements';
import { openConnectionStatus } from './util';
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

  test('Copy stats', { tag: '@only-headed' }, async ({ browser, context, page }, testInfo) => {
    test.skip(!!testInfo.project.use.headless, 'Only works in headed mode');
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.copyStatsTest();
  });

  test('Show connection history newest first without React key warnings', async ({ browser, context, page }, testInfo) => {
    const consoleMessages: string[] = [];
    page.on('console', (message) => consoleMessages.push(message.text()));
    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await connectionStatus.initUserPage();
    await connectionStatus.connectionHistoryRegression(consoleMessages);
  });

  test('Show the reload affordance when connection history fails to load', async ({ browser, context, page }, testInfo) => {
    await page.addInitScript(() => {
      const NativeWebSocket = window.WebSocket;
      // @ts-ignore test-only stub
      window.WebSocket = class extends NativeWebSocket {
        send(data: string) {
          try {
            const message = JSON.parse(data);
            if (message.type === 'subscribe'
              && message.payload?.query?.includes('subscription ConnectionStatus(')) {
              setTimeout(() => this.dispatchEvent(new MessageEvent('message', {
                data: JSON.stringify({
                  id: message.id,
                  type: 'error',
                  payload: [{ message: 'Forced connection history subscription error' }],
                }),
              })), 0);
              return;
            }
          } catch (error) {
            // Non-JSON WebSocket frames belong to the native implementation.
          }
          super.send(data);
        }
      };
    });

    // Degrade this client's RTT so it reaches an unstable status and gets listed in
    // Session Logs; without it the list stays empty under the shipped thresholds.
    await context.route('**/rtt-check**', async (route) => {
      await new Promise((resolve) => { setTimeout(resolve, 900); });
      await route.continue();
    });

    const connectionStatus = new ConnectionStatus(browser, context);
    await connectionStatus.initModPage(page, { testInfo });
    await page.evaluate(() => {
      (window as any).meetingClientSettings.public.app.showConnectionErrors.push(3006);
    });
    await openConnectionStatus(connectionStatus.modPage);
    await connectionStatus.modPage.page.click('#session-logs-tab');
    const rows = connectionStatus.modPage.page.locator(e.connectionStatusItemUser);
    await expect(rows.first()).toBeVisible({ timeout: 90000 });
    await rows.first().click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator(e.connectionStatusModal)).toBeHidden();

    // 4.0 surfaces this as a toast (role="alert"), not the 3.0 banner bar.
    await expect(page.locator('#connection-error-notification')).toContainText('code 3006');
    await expect(page.locator(e.notificationBannerReloadButton)).toBeVisible();
  });

});
