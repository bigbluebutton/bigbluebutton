import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function enableChatPopup(testPage: Page) {
  await testPage.waitAndClick(e.notificationsTab);
  await testPage.waitAndClickElement(e.chatPopupAlertsBtn);
}

export async function enableUserJoinPopup(testPage: Page) {
  await testPage.waitAndClick(e.notificationsTab);
  await testPage.waitAndClickElement(e.userJoinPushAlerts);
}

export async function saveSettings(testPage: Page) {
  await testPage.waitAndClick(e.modalConfirmButton);
}

export async function checkNotificationText(testPage: Page, text: string) {
  await testPage.hasText(e.smallToastMsg, text, 'should appear the text on the toast message notification');
}

export async function checkNotificationIcon(testPage: Page, icon: string) {
  const check = await testPage.checkElement(`${e.toastContainer} ${icon}`);
  expect(check).toBeTruthy();
}

export async function publicChatMessageToast(testPage: Page, testPage2: Page) {
  // Open private Chat with the other User
  await testPage.waitAndClick(e.userListItem);
  await testPage.waitAndClick(e.startPrivateChat);
  await testPage.waitForSelector(e.hidePrivateChat);
  // send a public message
  await testPage2.type(e.chatBox, e.publicMessage1);
  await testPage2.waitAndClick(e.sendButton);
}

export async function privateChatMessageToast(testPage: Page) {
  // Open private Chat with the other User
  await testPage.waitAndClick(e.userListItem);
  await testPage.waitAndClick(e.startPrivateChat);
  // wait for the private chat to be ready
  await testPage.waitUntilHaveCountSelector(e.chatButton, 2);
  // send a private message
  await testPage.type(e.chatBox, e.message1);
  await testPage.page.waitForTimeout(1000);
  await testPage.waitAndClick(e.sendButton);
}
