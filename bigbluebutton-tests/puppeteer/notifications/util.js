const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { getElementText, checkElement, checkElementLengthEqualTo } = require('../core/util');

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

async function waitForToast(test) {
  await test.waitForSelector(e.smallToastMsg);
  return test.page.evaluate(checkElement, e.smallToastMsg, 1);
}

async function getLastToastValue(test) {
  await test.waitForSelector(e.smallToastMsg);
  return test.page.evaluate(getElementText, e.smallToastMsg);
}

async function getOtherToastValue(test) {
  await test.waitForSelector(e.smallToastMsg);
  return test.page.evaluate(getElementText, e.smallToastMsg, 1);
}

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.waitAndClick(e.userListItem);
  await page1.waitAndClick(e.activeChat);
  // send a public message
  await page2.type(e.chatBox, e.publicMessage1);
  await page2.waitAndClick(e.sendButton);
  return e.publicChatToast;
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.waitAndClick(e.userListItem);
  await page2.waitAndClick(e.activeChat);
  // wait for the private chat to be ready
  await page2.page.waitForFunction(
    checkElementLengthEqualTo,
    { timeout: ELEMENT_WAIT_TIME },
    e.chatButton, 2
  );
  // send a private message
  await page2.type(e.chatBox, e.message1);
  await page2.waitAndClick(e.sendButton);
  return e.privateChatToast;
}

exports.privateChatMessageToast = privateChatMessageToast;
exports.publicChatMessageToast = publicChatMessageToast;
exports.enableUserJoinPopup = enableUserJoinPopup;
exports.getOtherToastValue = getOtherToastValue;
exports.getLastToastValue = getLastToastValue;
exports.enableChatPopup = enableChatPopup;
exports.saveSettings = saveSettings;
exports.waitForToast = waitForToast;
exports.popupMenu = popupMenu;
