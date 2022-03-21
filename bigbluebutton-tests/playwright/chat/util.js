const e = require('../core/elements');

async function openChat(test) {
  await test.waitForSelector(e.chatBox);
  await test.waitForSelector(e.chatMessages);
}

exports.openChat = openChat;
