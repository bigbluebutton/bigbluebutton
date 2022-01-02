const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { checkElementLengthEqualTo } = require('../core/util');

async function popupMenu(test) {
  await test.waitAndClick(e.options);
  await test.waitAndClick(e.settings);
}

async function enableChatPopup(test) {
  await test.waitAndClick(e.notificationsTab);
  await test.waitAndClickElement(e.chatPushAlerts);
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

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.waitAndClick(e.userListItem);
  await page1.waitAndClick(e.activeChat);
  // send a public message
  await page2.type(e.chatBox, e.publicMessage1);
  await page2.waitAndClick(e.sendButton);
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.waitAndClick(e.userListItem);
  await page2.waitAndClick(e.activeChat);
  // wait for the private chat to be ready
  await page2.page.waitForFunction(
    checkElementLengthEqualTo,
    [e.chatButton, 2],
    { timeout: ELEMENT_WAIT_TIME },
  );
  // send a private message
  await page2.type(e.chatBox, e.message1);
  await page2.waitAndClick(e.sendButton);
}

async function waitAndClearNotification(test) {
  await test.waitAndClick(e.smallToastMsg);
  await test.wasRemoved(e.smallToastMsg);
}

exports.privateChatMessageToast = privateChatMessageToast;
exports.publicChatMessageToast = publicChatMessageToast;
exports.enableUserJoinPopup = enableUserJoinPopup;
exports.checkNotificationText = checkNotificationText;
exports.enableChatPopup = enableChatPopup;
exports.saveSettings = saveSettings;
exports.popupMenu = popupMenu;
exports.waitAndClearNotification = waitAndClearNotification;
