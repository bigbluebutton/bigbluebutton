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

async function checkScreenshots(layoutTest, description, maskedSelectors, screenshotName, screenshotNumber) {
  const modPageWebcamsLocator = layoutTest.modPage.getLocator(maskedSelectors);
  await expect(layoutTest.modPage.page, description).toHaveScreenshot(`moderator-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    mask: [modPageWebcamsLocator],
  });

  const userWebcamsLocator = layoutTest.userPage.getLocator(maskedSelectors);
  await expect(layoutTest.userPage.page, description).toHaveScreenshot(`user-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    mask: [userWebcamsLocator],
  });
}

exports.reopenChatSidebar = reopenChatSidebar;
exports.checkScreenshots = checkScreenshots;
