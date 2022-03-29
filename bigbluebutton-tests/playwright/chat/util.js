const { default: test } = require('@playwright/test');
const e = require('../core/elements');
const { getSettings } = require('../core/settings');

async function openChat(testPage) {
  const { chatEnabled } = getSettings();
  test.fail(!chatEnabled, 'Chat is disabled');

  await testPage.waitForSelector(e.chatBox);
  await testPage.waitForSelector(e.chatMessages);
}

async function openPrivateChat(testPage) {
  const { chatEnabled } = getSettings();
  test.fail(!chatEnabled, 'Chat is disabled');

  await testPage.waitAndClick(e.userListItem);
  await testPage.waitAndClick(e.startPrivateChat);
}

exports.openChat = openChat;
exports.openPrivateChat = openPrivateChat;
