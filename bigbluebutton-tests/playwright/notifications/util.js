const { expect } = require('@playwright/test');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const e = require('../core/elements');
const { sleep } = require('../core/helpers');

async function enableChatPopup(test) {
  await test.waitAndClick(e.notificationsTab);
  await test.waitAndClickElement(e.chatPopupAlertsBtn);
}

async function enableUserJoinPopup(test) {
  await test.waitAndClick(e.notificationsTab);
  await test.waitAndClickElement(e.userJoinPushAlerts);
}

async function saveSettings(page) {
  await page.waitAndClick(e.modalConfirmButton);
}

async function checkNotificationText(test, text) {
  await test.hasText(e.smallToastMsg, text);
}

async function checkNotificationIcon(test, icon) {
  const check = await test.checkElement(`${e.toastContainer} ${icon}`);
  expect(check).toBeTruthy();
}

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.waitAndClick(e.userListItem);
  await page1.waitAndClick(e.startPrivateChat);
  await page1.waitForSelector(e.hidePrivateChat);
  // send a public message
  await page2.type(e.chatBox, e.publicMessage1);
  await page2.waitAndClick(e.sendButton);
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.waitAndClick(e.userListItem);
  await page2.waitAndClick(e.startPrivateChat);
  // wait for the private chat to be ready
  await page2.waitUntilHaveCountSelector(e.chatButton, 2);
  // send a private message
  await page2.type(e.chatBox, e.message1);
  await sleep(1000);
  await page2.waitAndClick(e.sendButton);
}

async function waitAndClearNotification(testPage) {
  await testPage.waitAndClick(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
  await testPage.wasRemoved(e.smallToastMsg);
}

async function waitAndClearDefaultPresentationNotification(testPage) {
  await testPage.waitForSelector(e.whiteboard,ELEMENT_WAIT_LONGER_TIME);
  const hasCurrentPresentationToast = await testPage.checkElement(e.currentPresentationToast);
  if (hasCurrentPresentationToast) {
    await waitAndClearNotification(testPage);
  }
}

exports.privateChatMessageToast = privateChatMessageToast;
exports.publicChatMessageToast = publicChatMessageToast;
exports.enableUserJoinPopup = enableUserJoinPopup;
exports.checkNotificationText = checkNotificationText;
exports.checkNotificationIcon = checkNotificationIcon;
exports.enableChatPopup = enableChatPopup;
exports.saveSettings = saveSettings;
exports.waitAndClearNotification = waitAndClearNotification;
exports.waitAndClearDefaultPresentationNotification = waitAndClearDefaultPresentationNotification;
