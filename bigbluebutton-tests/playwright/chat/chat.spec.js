const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { linkIssue, initializePages } = require('../core/helpers');
const { Chat } = require('./chat');

test.describe('Chat', () => {
  const chat = new Chat();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(chat, browser, { isMultiUser: true });
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#public-message-automated
  test('Send public message', { tag: '@ci' }, async () => {
    await chat.sendPublicMessage();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#private-message-automated
  test('Send private message', { tag: '@ci' }, async () => {
    await chat.sendPrivateMessage();
  });

  test('Clear chat', { tag: '@ci' }, async () => {
    await chat.clearChat();
  });

  test.skip('Copy chat', async () => {
    await chat.copyChat();
  });

  test('Save chat', { tag: '@ci' }, async ({}, testInfo) => {
    await chat.saveChat(testInfo);
  });

  test('Verify character limit', { tag: '@ci' }, async () => {
    await chat.characterLimit();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#sending-empty-chat-message-automated
  test('Not able to send an empty message', { tag: '@ci' }, async () => {
    await chat.emptyMessage();
  });

  test('Copy and paste public message', async () => {
    linkIssue('15948');
    await chat.copyPastePublicMessage();
  })

  test('Send emoji on public chat', { tag: '@ci' }, async () => {
    await chat.sendEmoji();
  });

  test.skip('Copy chat with emoji', async () => {
    // Only works in headed mode
    await chat.emojiCopyChat();
  });

  test('Close private chat', { tag: '@ci' }, async () => {
    await chat.closePrivateChat();
  });

  test('Save chat with emoji', { tag: '@ci' }, async ({}, testInfo) => {
    await chat.emojiSaveChat(testInfo);
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

  test('Auto convert emoji save chat', async ({}, testInfo) => {
    await chat.autoConvertEmojiSaveChat(testInfo);
  });

  test('Send auto converted emoji on private chat', async () => {
    await chat.autoConvertEmojiSendPrivateChat();
  });

  // failure only reproducible in CI (user leaves but keeps shown in the mod user list)
  test('Private chat disabled when user leaves meeting', { tag: ['@ci', '@flaky'] }, async () => {
    await chat.chatDisabledUserLeaves();
  });
});
