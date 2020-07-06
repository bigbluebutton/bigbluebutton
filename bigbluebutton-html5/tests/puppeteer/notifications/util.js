const ne = require('../notifications/elements');
const ule = require('../user/elements');
const ce = require('../chat/elements');
const e = require('../core/elements');

async function clickTestElement(element) {
  await document.querySelectorAll(element)[0].click();
}

async function popupMenu(test) {
  await test.page.evaluate(clickTestElement, e.options);
  await test.page.evaluate(clickTestElement, ne.settings);
}

async function enableChatPopup(test) {
  await test.waitForSelector(ne.chatPushAlerts);
  await test.page.evaluate(() => document.querySelector('[data-test="chatPushAlerts"]').children[0].click());
}

async function enableUserJoinPopup(test) {
  await test.waitForSelector(ne.userJoinPushAlerts);
  await test.page.evaluate(() => document.querySelector('[data-test="userJoinPushAlerts"]').children[0].click());
}

async function saveSettings(page) {
  await page.waitForSelector(ne.saveSettings);
  await page.click(ne.saveSettings, true);
}

async function waitForToast(test) {
  await test.waitForSelector(ne.smallToastMsg);
  const resp = await test.page.evaluate(getTestElement, ne.smallToastMsg) !== null;
  return resp;
}

async function getLastToastValue(test) {
  await test.waitForSelector(ne.smallToastMsg);
  const toast = test.page.evaluate(() => {
    const lastToast = document.querySelectorAll('[data-test="toastSmallMsg"]')[0].innerText;
    return lastToast;
  });
  return toast;
}

async function getOtherToastValue(test) {
  await test.waitForSelector(ne.smallToastMsg);
  const toast = test.page.evaluate(() => {
    const lastToast = document.querySelectorAll('[data-test="toastSmallMsg"]')[1].innerText;
    return lastToast;
  });
  return toast;
}

async function getTestElement(element) {
  await document.querySelectorAll(element)[1];
}

async function clickOnElement(element) {
  await document.querySelectorAll(element)[0].click();
}

async function clickThePrivateChatButton(element) {
  await document.querySelectorAll(element)[0].click();
}

async function publicChatMessageToast(page1, page2) {
  // Open private Chat with the other User
  await page1.page.evaluate(clickOnElement, ule.userListItem);
  await page1.page.evaluate(clickThePrivateChatButton, ce.activeChat);
  // send a public message
  await page2.page.type(ce.publicChat, ce.publicMessage1);
  await page2.page.click(ce.sendButton, true);
  return ne.publicChatToast;
}

async function privateChatMessageToast(page2) {
  // Open private Chat with the other User
  await page2.page.evaluate(clickOnElement, ule.userListItem);
  await page2.page.evaluate(clickThePrivateChatButton, ce.activeChat);
  // send a private message
  await page2.page.type(ce.privateChat, ce.message1);
  await page2.page.click(ce.sendButton, true);
  return ne.privateChatToast;
}

// File upload notification
async function uploadFileMenu(test) {
  await test.page.evaluate(clickOnElement, ne.dropdownContent);
  await test.page.evaluate(clickOnElement, ne.uploadPresentation);
}

async function getFileItemStatus(element, value) {
  document.querySelectorAll(element)[1].innerText.includes(value);
}

async function clickRandomPollOption(element) {
  document.querySelector(element).click();
}

async function startPoll(test) {
  await test.page.evaluate(clickOnElement, ne.dropdownContent);
  await test.page.evaluate(clickOnElement, ne.polling);
  await test.waitForSelector(ne.hidePollDesc);
  await test.waitForSelector(ne.polling);
  await test.page.evaluate(clickRandomPollOption, ne.polling);
  await test.waitForSelector(ne.publishLabel);
  await test.page.evaluate(clickOnElement, ne.publishLabel);
  await test.waitForSelector(ne.smallToastMsg);
}

exports.getFileItemStatus = getFileItemStatus;
exports.privateChatMessageToast = privateChatMessageToast;
exports.publicChatMessageToast = publicChatMessageToast;
exports.enableUserJoinPopup = enableUserJoinPopup;
exports.getOtherToastValue = getOtherToastValue;
exports.getLastToastValue = getLastToastValue;
exports.enableChatPopup = enableChatPopup;
exports.uploadFileMenu = uploadFileMenu;
exports.getTestElement = getTestElement;
exports.saveSettings = saveSettings;
exports.waitForToast = waitForToast;
exports.popupMenu = popupMenu;
exports.clickTestElement = clickTestElement;
exports.startPoll = startPoll;
exports.clickOnElement = clickOnElement;
