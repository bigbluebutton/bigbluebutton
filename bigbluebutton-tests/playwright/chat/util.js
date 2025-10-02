import { expect } from '@playwright/test';
import { elements as e } from '../core/elements.ts';
import { getSettings } from '../core/settings.ts';

export async function openPublicChat(testPage) {
  const { chatEnabled } = getSettings();

  if (!chatEnabled) {
    return testPage.wasRemoved(e.chatButton, 'public chat should not be displayed');
  }

  await testPage.hasElement(e.chatBox, 'should display the chat box for messaging');
  await testPage.hasElement(e.chatMessages, 'should display the chat messages');
  await testPage.hasElement(e.chatOptions, 'should display the chat options menu button');
}

export async function openPrivateChat(testPage) {
  const { chatEnabled } = getSettings();

  await testPage.waitAndClick(e.userListItem);
  if (!chatEnabled) {
    return testPage.wasRemoved(e.startPrivateChat, 'should not display the private chat');
  }
  const lastUserStartPrivateChat = await testPage.page.locator(e.startPrivateChat).last();
  await lastUserStartPrivateChat.click();
}

export async function getLastMessageSent(testPage) {
  return testPage.page.locator(e.chatUserMessageText).last();
}

export async function checkLastMessageSent(testPage, expectedMessage) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await expect(lastMessageSentLocator, 'should display the last message sent on the chat').toHaveText(expectedMessage);
}

export async function hoverLastMessage(testPage) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await lastMessageSentLocator.hover();
}
