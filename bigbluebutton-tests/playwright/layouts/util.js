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

exports.reopenChatSidebar = reopenChatSidebar;
