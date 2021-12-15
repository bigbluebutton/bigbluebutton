const e = require('../core/elements');

async function openChat(page) {
  await page.waitForSelector(e.chatBox);
  await page.waitForSelector(e.chatMessages);
}

exports.openChat = openChat;
