const { default: test, expect } = require('@playwright/test');
const e = require('../core/elements');
const { getSettings } = require('../core/settings');

async function openPublicChat(testPage) {
  const { chatEnabled } = getSettings();
  test.fail(!chatEnabled, 'Chat is disabled');

  await testPage.waitForSelector(e.chatBox);
  await testPage.waitForSelector(e.chatMessages);
  try {
    await testPage.waitForSelector(e.chatWelcomeMessageText);
  } catch {
    await testPage.waitAndClick(e.chatMessages);
    await testPage.down('Home');
    await testPage.waitForSelector(e.chatWelcomeMessageText);
    await testPage.down('End');
  }
}

async function openPrivateChat(testPage) {
  const { chatEnabled } = getSettings();
  test.fail(!chatEnabled, 'Chat is disabled');

  await testPage.waitAndClick(e.userListItem);
  await testPage.waitAndClick(e.startPrivateChat);
}

async function checkLastMessageSent(testPage, expectedMessage) {
  const lastMessageSent = await testPage.getLocator(e.chatUserMessageText).last();
  await expect(lastMessageSent).toHaveText(expectedMessage);
}

exports.openPublicChat = openPublicChat;
exports.openPrivateChat = openPrivateChat;
exports.checkLastMessageSent = checkLastMessageSent;
