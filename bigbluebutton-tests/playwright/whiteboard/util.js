const { expect } = require("playwright/test");
const { CI } = require("../core/constants");
const e = require('../core/elements');

async function snapshotComparison(modPage, userPage, snapshotName) {
  if (!CI) {
    // close all toast notifications before taking the screenshot
    await modPage.closeAllToastNotifications();
    await userPage.closeAllToastNotifications();
    // set the masks for the snapshot comparison
    const setMasks = (page) => [
      page.getLocator(e.presentationTitle),
      page.getLocator(e.chatNotificationMessageText).first(),
    ];
    // set proper viewport size for the snapshot comparison
    await modPage.setHeightWidthViewPortSize();
    await userPage.setHeightWidthViewPortSize();
    await expect(modPage.page).toHaveScreenshot(`moderator-${snapshotName}.png`, {
      mask: setMasks(modPage),
      maxDiffPixels: 1000,
    });
    await expect(userPage.page).toHaveScreenshot(`viewer-${snapshotName}.png`, {
      mask: setMasks(userPage),
      maxDiffPixels: 1000,
    });
  }
}

exports.snapshotComparison = snapshotComparison;
