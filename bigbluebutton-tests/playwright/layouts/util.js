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
  const getMaskedLocators = (testPage) => Array.isArray(maskedSelectors)
  ? maskedSelectors.map(selector => testPage.page.locator(selector))
  : [testPage.page.locator(maskedSelectors)];

  const modPageMaskedSelectors = getMaskedLocators(layoutTest.modPage);
  await expect(layoutTest.modPage.page, description).toHaveScreenshot(`moderator-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    mask: modPageMaskedSelectors,
  });

  const userPageMaskedSelectors = getMaskedLocators(layoutTest.userPage);
  await expect(layoutTest.userPage.page, description).toHaveScreenshot(`user-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    mask: userPageMaskedSelectors,
  });
}

export async function checkDefaultLocationReset(test) {
  await test.page.locator(e.webcamContainer).first().hover({ timeout: 5000 });
  await test.page.mouse.down();
  await test.page.locator(e.whiteboard).hover({ timeout: 5000 });
  
  // checking all dropAreas being displayed
  await test.hasElement(e.dropAreaBottom);
  await test.hasElement(e.dropAreaLeft);
  await test.hasElement(e.dropAreaRight);
  await test.hasElement(e.dropAreaTop);
  await test.hasElement(e.dropAreaSidebarBottom);
  await test.page.mouse.up();
}
