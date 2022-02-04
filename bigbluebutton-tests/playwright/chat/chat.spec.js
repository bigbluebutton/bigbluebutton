const { test } = require('@playwright/test');
const { Chat } = require('./chat');
const { PrivateChat } = require('./privateChat');

test.describe.parallel('Chat', () => {
  test('Send public message', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.sendPublicMessage();
  });

  test('Send private message', async ({ browser, context, page }) => {
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
    test.fixme(testInfo.config.projects[0].use.headless, 'Only works in headed mode');
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.copyChat(context);
  });

  test.skip('Save chat', async ({ browser, page }) => {
    test.fixme();
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.saveChat();
  });

  test('Verify character limit (5000 characters)', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.characterLimit();
  });

  test('Not able to send an empty message', async ({ browser, page }) => {
    const chat = new Chat(browser, page);
    await chat.init(true, true);
    await chat.emptyMessage();
  });

  test('Close private chat', async ({ browser, context, page }) => {
    const privateChat = new PrivateChat(browser, context);
    await privateChat.initPages(page);
    await privateChat.closeChat();
  });
});
