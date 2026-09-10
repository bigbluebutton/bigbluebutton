import { expect } from '@playwright/test';

import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

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
