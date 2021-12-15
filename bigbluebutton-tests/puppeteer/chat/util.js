const e = require('../core/elements');
const { sleep } = require('../core/helper');

async function openChat(test) {
  await test.waitForSelector(e.chatBox);
  await test.waitForSelector(e.chatMessages);
}

async function sendPublicChatMessage(page1, page2, testName) {
  // send a public message
  await page1.type(e.chatBox, e.publicMessage1);
  await page1.screenshot(testName, '01-before-User1-sends-message');
  await page1.waitAndClick(e.sendButton);
  await page2.type(e.chatBox, e.publicMessage2);
  await page2.screenshot(testName, '02-before-User2-sends-message');
  await page2.waitAndClick(e.sendButton);
}

async function openPrivateChatMessage(page1, page2) {
  // Open private Chat with the other User
  await page1.waitAndClick(e.userListItem);
  await page2.waitAndClick(e.userListItem);
  await page1.waitAndClick(e.activeChat);
  await sleep(500); // prevent a race condition when running on a deployed server
  await page2.waitAndClick(e.activeChat);
}

async function sendPrivateChatMessage(page1, page2, testName) {
  // send a private message
  await page1.waitForSelector(e.hidePrivateChat);
  await page2.waitForSelector(e.hidePrivateChat);

  await page1.type(e.chatBox, e.message1);
  await page1.screenshot(testName, '01-before-User1-sends-message');
  await page1.waitAndClick(e.sendButton);
  await page2.type(e.chatBox, e.message2);
  await page2.waitForSelector(e.chatUserMessageText);
  await page2.screenshot(testName, '02-before-User2-sends-message');
  await page2.waitAndClick(e.sendButton);
}

async function checkForPublicMessageReception(page1, page2) {
  const publicChat1 = await page1.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);
  const publicChat2 = await page2.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);

  const checkPublicMessage1 = await publicChat1[0].evaluate(n => n.innerText);
  const checkPublicMessage2 = await publicChat2[1].evaluate(n => n.innerText);

  const response = checkPublicMessage1 == e.publicMessage1 && checkPublicMessage2 == e.publicMessage2;
  return response == true;
}

async function checkForPrivateMessageReception(page1, page2) {
  const privateChat1 = await page1.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);
  const privateChat2 = await page2.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);

  const checkPrivateMessage1 = await privateChat1[0].evaluate(n => n.innerText);
  const checkPrivateMessage2 = await privateChat2[1].evaluate(n => n.innerText);

  const response = checkPrivateMessage1 == e.message1 && checkPrivateMessage2 == e.message2;
  return response == true;
}

async function getTestElements(test) {
  const messages = await test.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);
  return messages;
}

exports.openChat = openChat;
exports.getTestElements = getTestElements;
exports.openPrivateChatMessage = openPrivateChatMessage;
exports.sendPrivateChatMessage = sendPrivateChatMessage;
exports.checkForPublicMessageReception = checkForPublicMessageReception;
exports.checkForPrivateMessageReception = checkForPrivateMessageReception;
exports.sendPublicChatMessage = sendPublicChatMessage;
