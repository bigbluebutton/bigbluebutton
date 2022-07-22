const { test } = require('@playwright/test');
const { Chat } = require('./chat');
const { PrivateChat } = require('./privateChat');

test.describe.parallel('Chat', () => {
  // https://docs.bigbluebutton.org/2.5/release-tests.html#public-message-automated
  test('Send public message @ci', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.sendPublicMessage();
  });

  // https://docs.bigbluebutton.org/2.5/release-tests.html#private-message-automated
  test('Send private message @ci', async ({ browser, context, page }) => {
    const privateChat = new PrivateChat(browser, context);
    await privateChat.initPages(page);
    await privateChat.sendPrivateMessage();
  });

  test('Clear chat', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.clearChat();
  });

  test('Copy chat', async ({ browser, context, page }, testInfo) => {
    test.fixme(testInfo.project.use.headless, 'Only works in headed mode');
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.copyChat(context);
  });

  test('Save chat', async ({ browser, page }, testInfo) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.saveChat(testInfo);
  });

  // https://docs.bigbluebutton.org/2.5/release-tests.html#chat-character-limit-automated
  test('Verify character limit', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.characterLimit();
  });

  // https://docs.bigbluebutton.org/2.5/release-tests.html#sending-empty-chat-message-automated
  test('Not able to send an empty message', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.emptyMessage();
  });

  test('Close private chat @ci', async ({ browser, context, page }) => {
    const privateChat = new PrivateChat(browser, context);
    await privateChat.initPages(page);
    await privateChat.closeChat();
  });

  test('Private chat disabled when user leaves meeting @ci', async ({ browser, context, page }) => {
    const privateChat = new PrivateChat(browser, context);
    await privateChat.initPages(page);
    await privateChat.chatDisabledUserLeaves();
  });
});
