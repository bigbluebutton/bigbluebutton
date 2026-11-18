import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';

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

  test('uses one native button per trigger and zoom action', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    for (const selector of [e.optionsButton, e.mediaAreaButton, e.zoomOutButton]) {
      const trigger = modPage.page.locator(selector);
      await expect(trigger.locator('xpath=ancestor::*[@role="button"]')).toHaveCount(0);
    }
    await expect(modPage.page.locator(e.zoomOutButton)).toBeDisabled();
  });
});
