const e = require('./elements');

async function openChat(test) {
  // TODO: Check this if it's open before click
  // await test.click(ce.userList);
  // await test.click(e.chatButton, true);
  await test.waitForSelector(e.chatBox);
  await test.waitForSelector(e.chatMessages);
}

async function getTestElements(test) {
  const messages = await test.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);
  return messages;
}

exports.openChat = openChat;
exports.getTestElements = getTestElements;
