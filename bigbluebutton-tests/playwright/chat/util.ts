import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function openPublicChat(testPage: Page) {
  const { chatEnabled } = testPage.settings || {};

  if (!chatEnabled) {
    await testPage.wasRemoved(e.chatButton, 'public chat should not be displayed');
    return;
  }

  await testPage.hasElement(e.chatBox, 'should display the chat box for messaging');
  await testPage.hasElement(e.chatMessages, 'should display the chat messages');
  await testPage.hasElement(e.chatOptions, 'should display the chat options menu button');
}

export async function openPrivateChat(testPage: Page) {
  const { chatEnabled } = testPage.settings || {};

  await testPage.waitAndClick(e.userListItem);
  if (!chatEnabled) {
    await testPage.wasRemoved(e.startPrivateChat, 'should not display the private chat');
    return;
  }
  const lastUserStartPrivateChat = await testPage.page.locator(e.startPrivateChat).last();
  await lastUserStartPrivateChat.click();
}

export async function getLastMessageSent(testPage: Page) {
  return testPage.page.locator(e.chatUserMessageText).last();
}

export async function checkLastMessageSent(
  testPage: Page,
  expectedMessage: string | RegExp | ReadonlyArray<string | RegExp>,
) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await expect(lastMessageSentLocator, 'should display the last message sent on the chat').toHaveText(expectedMessage);
}

export async function hoverLastMessage(testPage: Page) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await lastMessageSentLocator.hover();
}
