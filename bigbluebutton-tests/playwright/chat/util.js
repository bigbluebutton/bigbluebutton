const selectors = require('../selectors');

async function openChat(page) {
  await page.waitForSelector(selectors.chatBox);
  await page.waitForSelector(selectors.chatMessages);
}

exports.openChat = openChat;