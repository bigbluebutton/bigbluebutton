const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { initializePages, linkIssue } = require('../core/helpers');
const { Chat } = require('./chat');

test.describe('Chat', { tag: '@ci' }, () => {
  const chat = new Chat();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(chat, browser, { isMultiUser: true });
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#public-message-automated
  test('Send public message', async () => {
    await chat.sendPublicMessage();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#private-message-automated
  test('Send private message', async () => {
    await chat.sendPrivateMessage();
  });

  test('Clear chat', async () => {
    await chat.clearChat();
  });

  test('Copy chat', async () => {
    await chat.copyChat();
  });

  test('Save chat', async ({}, testInfo) => {
    await chat.saveChat(testInfo);
  });

  test('Verify character limit', async () => {
    await chat.characterLimit();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sending-empty-chat-message-automated
  test('Not able to send an empty message', async () => {
    await chat.emptyMessage();
  });

  test('Copy and paste public message', async () => {
    await chat.copyPastePublicMessage();
  })

  test('Send emoji on public chat using emoji picker', { tag: '@setting-required:chat.emojiPicker' }, async () => {
    await chat.sendEmoji();
  });

  test('Copy chat with emoji', async () => {
    await chat.emojiCopyChat();
  });

  test('Hide public messages', async () => {
    await chat.hidePublicMessages();
  });

  test('Save chat with emoji', { tag: '@setting-required:chat.emojiPicker' }, async ({}, testInfo) => {
    await chat.emojiSaveChat(testInfo);
  });

  test('Send emoji on private chat', { tag: '@setting-required:chat.emojiPicker' }, async () => {
    await chat.emojiSendPrivateChat();
  });

  test('Send auto converted emoji on public chat', { tag: '@setting-required:chat.autoConvertEmoji' }, async () => {
    await chat.autoConvertEmojiPublicChat();
  });

  test('Copy chat with auto converted emoji', { tag: '@setting-required:chat.autoConvertEmoji' }, async () => {
    await chat.autoConvertEmojiCopyChat();
  });

  test('Auto convert emoji save chat', { tag: '@setting-required:chat.autoConvertEmoji' }, async ({}, testInfo) => {
    await chat.autoConvertEmojiSaveChat(testInfo);
  });

  test('Send auto converted emoji on private chat', { tag: '@setting-required:chat.autoConvertEmoji' }, async () => {
    await chat.autoConvertEmojiSendPrivateChat();
  });

  test('Private chat disabled when user leaves meeting', async () => {
    await chat.chatDisabledUserLeaves();
  });
});
