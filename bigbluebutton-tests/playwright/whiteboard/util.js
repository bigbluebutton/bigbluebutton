const { expect } = require("playwright/test");
const { CI } = require("../core/constants");

async function snapshotComparison(modPage, userPage, snapshotName) {
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

exports.snapshotComparison = snapshotComparison;
