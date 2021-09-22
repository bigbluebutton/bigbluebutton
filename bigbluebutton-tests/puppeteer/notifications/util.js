const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { clickElement, getElementText, checkElement, checkElementLengthEqualTo } = require('../core/util');

async function popupMenu(test) {
  await test.page.evaluate(clickElement, e.options);
  await test.page.evaluate(clickElement, e.settings);
}

async function enableChatPopup(test) {
  await test.waitForSelector(e.notificationsTab, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.notificationsTab);
  await test.waitForSelector(e.chatPushAlerts, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.chatPushAlerts);
}

async function enableUserJoinPopup(test) {
  await test.waitForSelector(e.notificationsTab, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.notificationsTab);
  await test.waitForSelector(e.userJoinPushAlerts, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.userJoinPushAlerts);
}

async function saveSettings(page) {
  await page.waitForSelector(e.modalConfirmButton, ELEMENT_WAIT_TIME);
  await page.click(e.modalConfirmButton, true);
}

async function waitForToast(test) {
  await test.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(checkElement, e.smallToastMsg, 1);
  return resp;
}

async function getLastToastValue(test) {
  await test.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_TIME);
  const toast = test.page.evaluate(getElementText, e.smallToastMsg);
  return toast;
}

async function getOtherToastValue(test) {
  await test.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_TIME);
  const toast = test.page.evaluate(getElementText, e.smallToastMsg, 1);
  return toast;
}

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.page.evaluate(clickElement, e.userListItem);
  await page1.page.evaluate(clickElement, e.activeChat);
  // send a public message
  await page2.page.type(e.publicChat, e.publicMessage1);
  await page2.click(e.sendButton, true);
  return e.publicChatToast;
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.page.evaluate(clickElement, e.userListItem);
  await page2.page.evaluate(clickElement, e.activeChat);
  // wait for the private chat to be ready
  await page2.page.waitForFunction(
    checkElementLengthEqualTo,
    { timeout: ELEMENT_WAIT_TIME },
    e.chatButton, 2
  );
  // send a private message
  await page2.page.type(e.privateChat, e.message1);
  await page2.click(e.sendButton, true);
  return e.privateChatToast;
}

// File upload notification
async function uploadFileMenu(test) {
  await test.click(e.actions);
  await test.click(e.uploadPresentation);
}

async function startPoll(test) {
  await test.click(e.actions);
  await test.click(e.polling);
  await test.waitForSelector(e.hidePollDesc, ELEMENT_WAIT_TIME);
  await test.waitForSelector(e.polling, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.polling);
  await test.waitForSelector(e.pollYesNoAbstentionBtn, ELEMENT_WAIT_TIME);
  await test.click(e.pollYesNoAbstentionBtn, true);
  await test.waitForSelector(e.startPoll, ELEMENT_WAIT_TIME);
  await test.click(e.startPoll, true);
  await test.waitForSelector(e.publishLabel, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.publishLabel);
}

exports.privateChatMessageToast = privateChatMessageToast;
exports.publicChatMessageToast = publicChatMessageToast;
exports.enableUserJoinPopup = enableUserJoinPopup;
exports.getOtherToastValue = getOtherToastValue;
exports.getLastToastValue = getLastToastValue;
exports.enableChatPopup = enableChatPopup;
exports.uploadFileMenu = uploadFileMenu;
exports.saveSettings = saveSettings;
exports.waitForToast = waitForToast;
exports.popupMenu = popupMenu;
exports.startPoll = startPoll;
