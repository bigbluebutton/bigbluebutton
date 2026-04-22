import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

export async function reopenChatSidebar(testPage: Page) {
  await testPage.waitAndClick(e.userListToggleBtn);
  try {
    await testPage.hasElement(
      e.hidePublicChat,
      'should display the hide public chat button when the chat sidebar is open',
    );
  } catch {
    await testPage.waitAndClick(e.chatButton);
    await testPage.hasElement(
      e.hidePublicChat,
      'should display the hide public chat button when the chat sidebar is open',
    );
  }
}

export async function checkScreenshots(
  layoutTest: MultiUsers,
  description: string,
  maskedSelectors: string[] | string,
  screenshotName: string,
  screenshotNumber?: number,
) {
  const getMaskedLocators = (testPage: Page) =>
    Array.isArray(maskedSelectors)
      ? maskedSelectors.map((selector) => testPage.page.locator(selector))
      : [testPage.page.locator(maskedSelectors)];

  const modPageMaskedSelectors = getMaskedLocators(layoutTest.modPage);
  await expect(layoutTest.modPage.page, description).toHaveScreenshot(
    `moderator-${screenshotName}${screenshotNumber ? `-${screenshotNumber}` : ''}.png`,
    {
      mask: modPageMaskedSelectors,
    },
  );

  const userPageMaskedSelectors = getMaskedLocators(layoutTest.userPage);
  await expect(layoutTest.userPage.page, description).toHaveScreenshot(
    `user-${screenshotName}${screenshotNumber ? `-${screenshotNumber}` : ''}.png`,
    {
      mask: userPageMaskedSelectors,
    },
  );
}

export async function checkDefaultLocationReset(testPage: Page) {
  await testPage.page.locator(e.webcamContainer).first().hover({ timeout: 5000 });
  await testPage.page.mouse.down();
  await testPage.page.locator(e.whiteboard).hover({ timeout: 5000 });

  // checking all dropAreas being displayed
  await testPage.hasElement(e.dropAreaBottom, 'bottom drop area should be displayed when dragging');
  await testPage.hasElement(e.dropAreaLeft, 'left drop area should be displayed when dragging');
  await testPage.hasElement(e.dropAreaRight, 'right drop area should be displayed when dragging');
  await testPage.hasElement(e.dropAreaTop, 'top drop area should be displayed when dragging');
  await testPage.hasElement(e.dropAreaSidebarBottom, 'sidebar bottom drop area should be displayed when dragging');
  await testPage.page.mouse.up();
}
