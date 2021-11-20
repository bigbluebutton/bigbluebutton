const elements = require('../elements');

async function openChat(page) {
  await page.waitForSelector(elements.chatBox);
  await page.waitForSelector(elements.chatMessages);
}

exports.openChat = openChat;
