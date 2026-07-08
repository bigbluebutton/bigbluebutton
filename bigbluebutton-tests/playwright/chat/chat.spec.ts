import { test } from '../core/setup/fixtures';
import { Chat } from './chat';
import { ChatImagePaste } from './imagePaste';
import { Jumbomoji } from './jumbomoji';
import { MessageActions } from './messageActions';
import { PrivateChatListPreview } from './privateChatListPreview';

// Rendering the sent <img> needs chat.imagePaste (to stage/upload) AND
// chat.markdownImageAllowed (the akka markdown renderer only emits <img> when this
// is on); both settings must be enabled for the image-paste tests to pass.
const imagePasteTags = ['@setting-required:chat.imagePaste', '@setting-required:chat.markdownImageAllowed'];

test.describe.parallel('Chat', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#public-message-automated
  test('Send public message', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.sendPublicMessage();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#private-message-automated
  test('Send private message', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.sendPrivateMessage();
  });

  test('Clear chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.clearChat();
  });

  test('Copy chat', async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.copyChat();
  });

  test('Save chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.saveChat();
  });

  test.fixme('Verify character limit', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.characterLimit();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sending-empty-chat-message-automated
  test('Not able to send an empty message', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.emptyMessage();
  });

  test('Copy and paste public message', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.copyPastePublicMessage();
  });

  test(
    'Send emoji on public chat using emoji picker',
    { tag: '@setting-required:chat.emojiPicker' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.sendEmoji();
    },
  );

  test('Copy chat with emoji', async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.emojiCopyChat();
  });

  test('Hide public messages', async ({ browser, context, page }) => {
    const chat = new Chat(browser, context);
    await chat.initModPage(page);
    await chat.hidePublicMessages();
  });

  test('Close private chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.closePrivateChat();
  });

  test(
    'Save chat with emoji',
    { tag: '@setting-required:chat.emojiPicker' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.emojiSaveChat();
    },
  );

  test(
    'Send emoji on private chat',
    { tag: '@setting-required:chat.emojiPicker' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.emojiSendPrivateChat();
    },
  );

  test(
    'Send auto converted emoji on public chat',
    { tag: '@setting-required:chat.autoConvertEmoji' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.autoConvertEmojiPublicChat();
    },
  );

  test(
    'Escape auto converted emoji with a backslash on public chat',
    { tag: '@setting-required:chat.autoConvertEmoji' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.autoConvertEmojiEscapePublicChat();
    },
  );

  test(
    'Copy chat with auto converted emoji',
    { tag: '@setting-required:chat.autoConvertEmoji' },
    async ({ browser, context, page, browserName }, testInfo) => {
      test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.autoConvertEmojiCopyChat();
    },
  );

  test(
    'Auto convert emoji save chat',
    { tag: '@setting-required:chat.autoConvertEmoji' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.autoConvertEmojiSaveChat();
    },
  );

  test(
    'Send auto converted emoji on private chat',
    { tag: '@setting-required:chat.autoConvertEmoji' },
    async ({ browser, context, page }, testInfo) => {
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.autoConvertEmojiSendPrivateChat();
    },
  );

  test('Private chat disabled when user leaves meeting', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.chatDisabledUserLeaves();
  });

  test('Jumbomoji renders emoji-only messages with larger font', async ({ browser, context, page }, testInfo) => {
    const jumbomoji = new Jumbomoji(browser, context);
    await jumbomoji.initModPage(page, { testInfo });
    await jumbomoji.verifyJumbomoji();
  });

  test('Private chat preview renders at first paint', async ({ browser, context, page }, testInfo) => {
    const preview = new PrivateChatListPreview(browser, context);
    await preview.initModPage(page, { testInfo });
    await preview.initUserPageWithDelayedPreview(testInfo);
    await preview.previewRendersAtFirstPaint();
  });

  test('Private chat preview shows deleted label for a soft-deleted last message', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const preview = new PrivateChatListPreview(browser, context);
    await preview.initPages(page, testInfo);
    await preview.deletedLastMessageRendersDeletedLabel();
  });

  test.describe('Message actions', () => {
    test.describe('Edit', () => {
      test('Edit a message using the toolbar button', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.editMessageFromToolbarButton();
      });

      test('Edit a message using the arrow up key', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.editMessageFromArrowUp();
      });

      test('Able to edit only their own message sent', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.ableToEditOwnMessage();
      });
    });

    test.describe('Delete', () => {
      test('Delete own message', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.deleteOwnMessage();
      });

      test('Moderator can delete a message from another user', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.deleteAnotherUserMessage();
      });

      test(
        'User can delete only his own messages in breakout rooms',
        { tag: '@flaky-3.1' },
        async ({ browser, context, page }, testInfo) => {
          const message = new MessageActions(browser, context);
          await message.initPages(page, testInfo);
          await message.breakoutsModDelete();
        },
      );
    });

    test.describe('Reply', () => {
      test('Reply to a message', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initModPage(page, { testInfo });
        await message.replyMessage();
      });

      test('Reply to a message with text followed by a link', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initModPage(page, { testInfo });
        await message.replyMessageWithTextBeforeLink();
      });

      test('Cancel a reply to a message', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initModPage(page, { testInfo });
        await message.cancelReplyMessage();
      });

      test('Scroll to replied message', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.scrollToRepliedMessage();
      });
    });

    test.describe('Reactions', () => {
      test('Add and remove a message reaction', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.addRemoveReaction();
      });

      test('Increment and decrement a message reaction', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.incrementDecrementReaction();
      });

      test('Order message reaction by highest amount', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.orderReactions();
      });
    });
  });

  test.describe('Image paste', { tag: imagePasteTags }, () => {
    test('Paste an image, preview it and send it', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initPages(page, testInfo);
      await chat.pasteAndSendImage();
    });

    test('Remove the pasted image before sending', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.removePreviewBeforeSend();
    });

    test('Reject an image above the size limit', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.rejectsOversizeImage();
    });

    test('Reject an unsupported image type', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.rejectsUnsupportedType();
    });

    test('Strip an externally hosted image from a sent message', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.dropsExternalImage();
    });
  });
});
