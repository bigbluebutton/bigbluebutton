const { test } = require('../fixtures');
const { Chat } = require('./chat');
const { MessageActions } = require('./messageActions');

test.describe('Chat', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#public-message-automated
  test('Send public message', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.sendPublicMessage();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#private-message-automated
  test('Send private message', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.sendPrivateMessage();
  });

  test('Clear chat', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.clearChat();
  });

  test('Copy chat', async ({ browser, context, page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.copyChat();
  });

  test('Save chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.saveChat(testInfo);
  });

  test('Verify character limit', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.characterLimit();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sending-empty-chat-message-automated
  test('Not able to send an empty message', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.emptyMessage();
  });

  test('Copy and paste public message', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.copyPastePublicMessage();
  })

  test('Send emoji on public chat using emoji picker', { tag: '@setting-required:chat.emojiPicker' }, async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.sendEmoji();
  });

  test('Copy chat with emoji', async ({ browser, context, page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.emojiCopyChat();
  });

  test('Hide public messages', async () => {
    const chat = new Chat(browser, context);
    await chat.initModPage(page);
    await chat.hidePublicMessages();
  });

  test('Save chat with emoji', { tag: '@setting-required:chat.emojiPicker' }, async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.emojiSaveChat(testInfo);
  });

  test('Send emoji on private chat', { tag: '@setting-required:chat.emojiPicker' }, async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.emojiSendPrivateChat();
  });

  test('Send auto converted emoji on public chat', { tag: '@setting-required:chat.autoConvertEmoji' }, async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.autoConvertEmojiPublicChat();
  });

  test('Copy chat with auto converted emoji', { tag: '@setting-required:chat.autoConvertEmoji' }, async ({ browser, context, page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.autoConvertEmojiCopyChat();
  });

  test('Auto convert emoji save chat', { tag: '@setting-required:chat.autoConvertEmoji' }, async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.autoConvertEmojiSaveChat(testInfo);
  });

  test('Send auto converted emoji on private chat', { tag: '@setting-required:chat.autoConvertEmoji' }, async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.autoConvertEmojiSendPrivateChat();
  });

  test('Private chat disabled when user leaves meeting', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page);
    await chat.chatDisabledUserLeaves();
  });

  test.describe('Message actions', () => {
    test.describe('Edit', () => {
      test('Edit a message using the toolbar button', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.editMessageFromToolbarButton();
      });

      test('Edit a message using the arrow up key', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.editMessageFromArrowUp();
      });

      test('Able to edit only their own message sent', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.ableToEditOwnMessage();
      });
    });

    test.describe('Delete', () => {
      test('Delete own message', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.deleteOwnMessage();
      });

      test('Moderator can delete a message from another user', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.deleteAnotherUserMessage();
      });

      test('User can delete only his own messages in breakout rooms', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.breakoutsModDelete();
      });
    });

    test.describe('Reply', () => {
      test('Reply to a message', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initModPage(page);
        await message.replyMessage();
      });

      test('Cancel a reply to a message', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initModPage(page);
        await message.cancelReplyMessage();
      });

      test('Scroll to replied message', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.scrollToRepliedMessage();
      });
    });

    test.describe('Reactions', () => {
      test('Add and remove a message reaction', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.addRemoveReaction();
      });

      test('Increment and decrement a message reaction', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.incrementDecrementReaction();
      });

      test('Order message reaction by highest amount', async ({ browser, context, page }) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page);
        await message.orderReactions();
      });
    });
  });
});
