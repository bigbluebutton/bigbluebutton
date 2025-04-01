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
  const getMaskedLocators = (page) => Array.isArray(maskedSelectors)
  ? maskedSelectors.map(selector => page.getLocator(selector))
  : [page.getLocator(maskedSelectors)];

  const modPageMaskedSelectors = getMaskedLocators(layoutTest.modPage);
  await expect(layoutTest.modPage.page, description).toHaveScreenshot(`moderator-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    mask: modPageMaskedSelectors,
  });

  const userPageMaskedSelectors = getMaskedLocators(layoutTest.userPage);
  await expect(layoutTest.userPage.page, description).toHaveScreenshot(`user-${screenshotName}${screenshotNumber ? '-' + screenshotNumber : ''}.png`, {
    mask: userPageMaskedSelectors,
  });
}

exports.reopenChatSidebar = reopenChatSidebar;
exports.checkScreenshots = checkScreenshots;
