import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';

const MOBILE_USER_AGENT = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  'AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
].join(' ');

test.describe.parallel('Accessible menu triggers', { tag: '@ci' }, () => {
  test('exposes the options menu state and restores focus', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const optionsButton = session.modPage.page.locator(e.optionsButton);

    await expect(optionsButton).toHaveAttribute('aria-haspopup', 'menu');
    await expect(optionsButton).toHaveAttribute('aria-expanded', 'false');
    await optionsButton.click();
    await expect(optionsButton).toHaveAttribute('aria-expanded', 'true');
    await session.modPage.page.keyboard.press('Escape');
    await expect(optionsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(optionsButton).toBeFocused();
  });

  test('exposes the media area state', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const mediaAreaButton = session.modPage.page.locator(e.mediaAreaButton);

    await expect(mediaAreaButton).toHaveAttribute('aria-expanded', 'false');
    await mediaAreaButton.click();
    await expect(mediaAreaButton).toHaveAttribute('aria-expanded', 'true');
    await session.modPage.page.keyboard.press('Escape');
    await expect(mediaAreaButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('exposes menu state on both mobile audio triggers', async ({ browser }, testInfo) => {
    const mobileContext = await browser.newContext({
      userAgent: MOBILE_USER_AGENT,
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    const session = new MultiUsers(browser, mobileContext);
    await session.initModPage(mobilePage, { testInfo, shouldCloseAudioModal: false });
    const { modPage } = session;

    await modPage.waitAndClick(e.joinEchoTestButton);
    await modPage.waitForSelector(e.audioDropdownMenu);
    const primaryTrigger = modPage.page.locator(e.leaveListenOnly);
    const arrowTrigger = modPage.page.locator(e.audioDropdownMenu);
    for (const trigger of [primaryTrigger, arrowTrigger]) {
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }

    await primaryTrigger.click();
    await expect(primaryTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(arrowTrigger).toHaveAttribute('aria-expanded', 'true');
    await modPage.page.keyboard.press('Escape');
    await expect(primaryTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(arrowTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('uses one native button per trigger and zoom action', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    for (const selector of [e.optionsButton, e.mediaAreaButton, e.zoomOutButton]) {
      const trigger = modPage.page.locator(selector);
      await expect(trigger).toBeVisible();
      await expect(trigger.locator('xpath=ancestor::*[@role="button"]')).toHaveCount(0);
    }
    await expect(modPage.page.locator(e.zoomOutButton)).toBeDisabled();
  });
});
