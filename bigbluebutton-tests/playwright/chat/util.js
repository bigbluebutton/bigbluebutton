const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { getSettings } = require('../core/settings');

async function openPublicChat(testPage) {
  const { chatEnabled } = getSettings();

  if (!chatEnabled) {
    return testPage.wasRemoved(e.chatButton, 'public chat should not be displayed');
  }

  await testPage.hasElement(e.chatBox, 'should display the chat box for messaging');
  await testPage.hasElement(e.chatMessages, 'should display the chat messages');
  await testPage.hasElement(e.chatOptions, 'should display the chat options menu button');
}

async function openPrivateChat(testPage) {
  const { chatEnabled } = getSettings();
  await testPage.waitAndClick(e.usersListSidebarButton);

  if (!chatEnabled) {
    await testPage.waitForSelector(e.userListItem);
    return await testPage.wasRemoved(e.startPrivateChat, 'should not display the private chat');
  }
  await testPage.waitAndClick(e.startPrivateChat);
}

async function checkLastMessageSent(testPage, expectedMessage) {
  const lastMessageSent = await testPage.getLocator(e.chatUserMessageText).last();
  await expect(lastMessageSent, 'should display the last message sent on the chat').toHaveText(expectedMessage);
}

exports.openPublicChat = openPublicChat;
exports.openPrivateChat = openPrivateChat;
exports.checkLastMessageSent = checkLastMessageSent;
