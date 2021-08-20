const ne = require('./elements');
const ule = require('../user/elements');
const ce = require('../chat/elements');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { clickElement, getElementText, checkElement, checkElementLengthEqualTo } = require('../core/util');

async function popupMenu(test) {
  await test.page.evaluate(clickElement, e.options);
  await test.page.evaluate(clickElement, ne.settings);
}

async function enableChatPopup(test) {
  await test.waitForSelector(ne.notificationsTab, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ne.notificationsTab);
  await test.waitForSelector(ne.chatPushAlerts, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ne.chatPushAlerts);
}

async function enableUserJoinPopup(test) {
  await test.waitForSelector(ne.notificationsTab, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ne.notificationsTab);
  await test.waitForSelector(ne.userJoinPushAlerts, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ne.userJoinPushAlerts);
}

async function saveSettings(page) {
  await page.waitForSelector(ne.saveSettings, ELEMENT_WAIT_TIME);
  await page.click(ne.saveSettings, true);
}

async function waitForToast(test) {
  await test.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(checkElement, ne.smallToastMsg, 1);
  return resp;
}

async function getLastToastValue(test) {
  await test.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
  const toast = test.page.evaluate(getElementText, ne.smallToastMsg);
  return toast;
}

async function getOtherToastValue(test) {
  await test.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
  const toast = test.page.evaluate(getElementText, ne.smallToastMsg, 1);
  return toast;
}

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.page.evaluate(clickElement, ule.userListItem);
  await page1.page.evaluate(clickElement, ce.activeChat);
  // send a public message
  await page2.page.type(ce.publicChat, ce.publicMessage1);
  await page2.click(ce.sendButton, true);
  return ne.publicChatToast;
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.page.evaluate(clickElement, ule.userListItem);
  await page2.page.evaluate(clickElement, ce.activeChat);
  // wait for the private chat to be ready
  await page2.page.waitForFunction(
    checkElementLengthEqualTo,
    { timeout: ELEMENT_WAIT_TIME },
    ce.chatButton, 2
  );
  // send a private message
  await page2.page.type(ce.privateChat, ce.message1);
  await page2.click(ce.sendButton, true);
  return ne.privateChatToast;
}

// File upload notification
async function uploadFileMenu(test) {
  await test.click(e.actions);
  await test.click(ne.uploadPresentation);
}

async function startPoll(test) {
  await test.page.evaluate(clickElement, ne.dropdownContent);
  await test.page.evaluate(clickElement, ne.polling);
  await test.waitForSelector(ne.hidePollDesc, ELEMENT_WAIT_TIME);
  await test.waitForSelector(ne.polling, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ne.polling);
  await test.waitForSelector(ne.pollYesNoAbstentionBtn, ELEMENT_WAIT_TIME);
  await test.click(ne.pollYesNoAbstentionBtn, true);
  await test.waitForSelector(ne.startPoll, ELEMENT_WAIT_TIME);
  await test.click(ne.startPoll, true);
  await test.waitForSelector(ne.publishLabel, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ne.publishLabel);
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
