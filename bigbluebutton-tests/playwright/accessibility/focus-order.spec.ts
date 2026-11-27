import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';

test.describe.parallel('Focus order', { tag: '@ci' }, () => {
  test('returns focus to the chat button after minimizing chat', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    const chatButton = modPage.page.locator(e.messagesSidebarButton);
    if (!(await modPage.page.locator(e.hidePublicChat).isVisible())) {
      await chatButton.click();
    }
    await modPage.page.locator(e.hidePublicChat).click();

    await expect(chatButton).toBeFocused();
  });

  test('returns focus to the media area button after closing media sharing', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;
    const mediaAreaButton = modPage.page.locator(e.mediaAreaButton);
    const optionsButton = modPage.page.locator(e.optionsButton);

    await mediaAreaButton.click();
    await modPage.page.locator(e.mediaAreaCloseButton).click();
    await expect(mediaAreaButton).toBeFocused();

    await mediaAreaButton.click();
    await modPage.page.locator(e.mediaAreaCloseButton).focus();
    await modPage.page.keyboard.press('Escape');
    await expect(mediaAreaButton).toBeFocused();

    await mediaAreaButton.click();
    await optionsButton.focus();
    await modPage.page.keyboard.press('Escape');
    await expect(modPage.page.locator(e.mediaAreaCloseButton)).not.toBeVisible();
    await expect(optionsButton).toBeFocused();
  });
});
