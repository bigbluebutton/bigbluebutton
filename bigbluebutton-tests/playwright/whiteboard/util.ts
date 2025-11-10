import { expect } from 'playwright/test';

import { CI } from '../core/constants';
import { Page } from '../core/page';

export async function snapshotComparison(modPage: Page, userPage: Page, snapshotName: string) {
  if (!CI) {
    // close all toast notifications before taking the screenshot
    await modPage.closeAllToastNotifications();
    await userPage.closeAllToastNotifications();
    // compare the snapshots
    await expect(modPage.page).toHaveScreenshot(`moderator-${snapshotName}.png`, {
      maxDiffPixels: 1000,
    });
    await expect(userPage.page).toHaveScreenshot(`viewer-${snapshotName}.png`, {
      maxDiffPixels: 1000,
    });
  }
}
