const { expect } = require('@playwright/test');
const e = require('../core/elements');

async function reopenChatSidebar(page) {
  await page.waitAndClick(e.userListToggleBtn);
  try {
    await page.hasElement(e.hidePublicChat);
  } catch {
    await page.waitAndClick(e.chatButton);
    await page.hasElement(e.hidePublicChat);
  }
}

async function checkScreenshots(layoutTest, maskedSelectors, screenshotName, screenshotNumber) {
  const modPageWebcamsLocator = layoutTest.modPage.getLocator(maskedSelectors);
  await expect(layoutTest.modPage.page).toHaveScreenshot(`moderator-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    maxDiffPixelRatio: 0.005,
    mask: [modPageWebcamsLocator],
  });

  const userWebcamsLocator = layoutTest.userPage.getLocator(maskedSelectors);
  await expect(layoutTest.userPage.page).toHaveScreenshot(`user-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    maxDiffPixelRatio: 0.005,
    mask: [userWebcamsLocator],
  });
}

exports.reopenChatSidebar = reopenChatSidebar;
exports.checkScreenshots = checkScreenshots;
