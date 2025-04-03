const { expect } = require('@playwright/test');
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

async function checkNotificationText(test, text) {
  await test.hasText(e.smallToastMsg, text, 'should appear the text on the toast message notification');
}

async function checkNotificationIcon(test, icon) {
  const check = await test.checkElement(`${e.toastContainer} ${icon}`);
  expect(check).toBeTruthy();
}

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.waitAndClick(e.usersListSidebarButton);
  await page1.waitAndClick(e.startPrivateChat);
  await page1.waitForSelector(e.privateChatBackButton);
  // send a public message
  await page2.type(e.chatBox, e.publicMessage1);
  await page2.waitAndClick(e.sendButton);
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.waitAndClick(e.usersListSidebarButton);
  await page2.waitAndClick(e.startPrivateChat);
  // wait for the private chat to be ready
  await page2.hasElement(e.privateChatBackButton, 'should display the private chat back button');
  // send a private message
  await page2.type(e.chatBox, e.message1);
  await sleep(1000);
  await page2.waitAndClick(e.sendButton);
}

exports.privateChatMessageToast = privateChatMessageToast;
exports.publicChatMessageToast = publicChatMessageToast;
exports.enableUserJoinPopup = enableUserJoinPopup;
exports.checkNotificationText = checkNotificationText;
exports.checkNotificationIcon = checkNotificationIcon;
exports.enableChatPopup = enableChatPopup;
