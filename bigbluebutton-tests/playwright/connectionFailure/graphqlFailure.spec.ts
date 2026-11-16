import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';

test.describe('GraphQL connection failure', { tag: '@ci' }, () => {
  test.beforeEach(async ({ browser, page }, testInfo) => {
    testInfo.setTimeout(120_000);

    // Block the GraphQL WebSocket so it never connects
    await page.routeWebSocket('**/graphql', () => {
      /* never connect */
    });
    const attendeePage = new Page(browser, page, testInfo);
    await attendeePage.init(false, { shouldCheckAllInitialSteps: false, testInfo });
  });

  test('Loading screen stays visible while graphql is retrying', async ({ page }) => {
    await expect(page.locator(e.loadingScreen)).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(10_000);
    await expect(page.locator(e.loadingScreen)).toBeVisible();
    await expect(page.locator(e.errorScreenMessage)).toBeHidden();
  });

  test('Error screen appears after connection timeout', { tag: '@nightly' }, async ({ page }) => {
    // terminateAndRetry defaults to 30s — error screen should appear shortly after
    await expect(page.locator(e.loadingScreen)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(e.errorScreenMessage)).toBeVisible({ timeout: 60_000 });
  });
});
