const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { getSettings } = require('../core/settings');

async function openPublicChat(testPage) {
  const { chatEnabled } = getSettings();

  if(!chatEnabled) {
    return testPage.wasRemoved(e.chatButton, 'public chat should not be displayed');
  }

  await testPage.hasElement(e.chatBox, 'should display the chat box for messaging');
  await testPage.hasElement(e.chatMessages, 'should display the chat messages');
  await testPage.hasElement(e.chatOptions, 'should display the chat options menu button');
}

async function openPrivateChat(testPage) {
  const { chatEnabled } = getSettings();

  await testPage.waitAndClick(e.userListItem);
  if(!chatEnabled) {
    return await testPage.wasRemoved(e.startPrivateChat, 'should not display the private chat');
  }
  const lastUserStartPrivateChat = await testPage.getLocator(e.startPrivateChat).last();
  await testPage.clickOnLocator(lastUserStartPrivateChat);
}

async function getLastMessageSent(testPage) {
  return testPage.getLocator(e.chatUserMessageText).last();
}

async function checkLastMessageSent(testPage, expectedMessage) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await expect(lastMessageSentLocator, 'should display the last message sent on the chat').toHaveText(expectedMessage);
}

async function hoverLastMessage(testPage) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await lastMessageSentLocator.hover();
}

exports.openPublicChat = openPublicChat;
exports.openPrivateChat = openPrivateChat;
exports.getLastMessageSent = getLastMessageSent;
exports.checkLastMessageSent = checkLastMessageSent;
exports.hoverLastMessage = hoverLastMessage;
