import { expect } from '@playwright/test';
import { elements as e } from '../core/elements.ts';

export async function reopenChatSidebar(page) {
  await page.waitAndClick(e.userListToggleBtn);
  try {
    await page.hasElement(e.hidePublicChat);
  } catch {
    await page.waitAndClick(e.chatButton);
    await page.hasElement(e.hidePublicChat);
  }
}

export async function checkScreenshots(layoutTest, description, maskedSelectors, screenshotName, screenshotNumber) {
  const getMaskedLocators = (testPage) =>
    Array.isArray(maskedSelectors)
      ? maskedSelectors.map((selector) => testPage.page.locator(selector))
      : [testPage.page.locator(maskedSelectors)];

  const modPageMaskedSelectors = getMaskedLocators(layoutTest.modPage);
  await expect(layoutTest.modPage.page, description).toHaveScreenshot(
    `moderator-${screenshotName}${screenshotNumber ? `-${screenshotNumber}` : ''}.png`,
    {
      mask: modPageMaskedSelectors,
    }
  );

  const userPageMaskedSelectors = getMaskedLocators(layoutTest.userPage);
  await expect(layoutTest.userPage.page, description).toHaveScreenshot(
    `user-${screenshotName}${screenshotNumber ? `-${screenshotNumber}` : ''}.png`,
    {
      mask: userPageMaskedSelectors,
    }
  );
}

export async function checkDefaultLocationReset(testPage) {
  await testPage.locator(e.webcamContainer).first().hover({ timeout: 5000 });
  await testPage.mouse.down();
  await testPage.locator(e.whiteboard).hover({ timeout: 5000 });

  // checking all dropAreas being displayed
  await testPage.hasElement(e.dropAreaBottom);
  await testPage.hasElement(e.dropAreaLeft);
  await testPage.hasElement(e.dropAreaRight);
  await testPage.hasElement(e.dropAreaTop);
  await testPage.hasElement(e.dropAreaSidebarBottom);
  await testPage.page.mouse.up();
}
