import { test } from '../core/setup/fixtures';
import { expect } from '@playwright/test';
import { createMeeting, getJoinURL } from '../core/helpers';

test.describe('GraphQL connection failure', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(120_000);

    const meetingID = await createMeeting();
    const joinURL = getJoinURL({ meetingID, fullName: 'Claude' });

    // Block the GraphQL WebSocket so it never connects
    await page.routeWebSocket('**/graphql', () => { /* never connect */ });
    await page.goto(joinURL);
  });

  test('Loading screen stays visible while graphql is retrying', async ({ page }) => {
    await expect(page.locator('[data-test="loadingScreen"]')).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(10_000);
    await expect(page.locator('[data-test="loadingScreen"]')).toBeVisible();
  });

  test('Error screen appears after connection timeout', async ({ page }) => {
    // terminateAndRetry defaults to 30s — error screen should appear shortly after
    await expect(page.locator('[data-test="loadingScreen"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('h1[data-test="errorScreenMessage"]')).toBeVisible({ timeout: 60_000 });
  });
});
