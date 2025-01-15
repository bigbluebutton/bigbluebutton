const { test } = require('@playwright/test');
const { fullyParallel } = require('../playwright.config');
const { linkIssue } = require('../core/helpers');
const { Chat } = require('./chat');

if (!fullyParallel) test.describe.configure({ mode: 'serial' });

test.describe('Chat', () => {
  const chat = new Chat();
  let context;
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    const page = await context.newPage();
    await chat.initModPage(page, true);
    await chat.initUserPage(true, context);
  });

  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#public-message-automated
  test('Send public message @ci', async () => {
    await chat.sendPublicMessage();
  });

  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#private-message-automated
  test('Send private message @ci', async () => {
    await chat.sendPrivateMessage();
  });

  test('Clear chat @ci', async () => {
    await chat.clearChat();
  });

  test.skip('Copy chat', async () => {
    await chat.copyChat(context);
  });

  test('Save chat @ci', async ({}, testInfo) => {
    await chat.saveChat(testInfo);
  });

  test('Verify character limit', async () => {
    await chat.characterLimit();
  });

  // https://docs.bigbluebutton.org/2.7/testing/release-testing/#sending-empty-chat-message-automated
  test('Not able to send an empty message @ci', async () => {
    await chat.emptyMessage();
  });

  test('Copy and paste public message', async () => {
    linkIssue('15948');
    await chat.copyPastePublicMessage();
  })

  test('Send emoji on public chat @ci', async () => {
    await chat.sendEmoji();
  });

  test.skip('Copy chat with emoji', async () => {
    // Only works in headed mode
    await chat.emojiCopyChat();
  });

  test('Close private chat @ci', async () => {
    await chat.closePrivateChat();
  });

  test('Save chat with emoji @ci', async () => {
    await chat.emojiSaveChat();
  });

  test('Send emoji on private chat', async () => {
    await chat.emojiSendPrivateChat();
  });

  test('Send auto converted emoji on public chat', async () => {
    await chat.autoConvertEmojiPublicChat();
  });

  test.skip('Copy chat with auto converted emoji', async () => {
    await chat.autoConvertEmojiCopyChat();
  });

  test('Auto convert emoji save chat', async ({ context }, testInfo) => {
    await chat.autoConvertEmojiSaveChat(testInfo);
  });

  test('Send auto converted emoji on private chat', async () => {
    await chat.autoConvertEmojiSendPrivateChat();
  });

  test('Private chat disabled when user leaves meeting @ci', async () => {
    await chat.chatDisabledUserLeaves();
  });

  test('Prevent specific user from sending public chat messages @ci', async ({ context }) => {
    await chat.preventUserFromUsingPublicChat(context);
  });
});
