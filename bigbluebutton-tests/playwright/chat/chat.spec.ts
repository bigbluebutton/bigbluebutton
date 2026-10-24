import { test } from '../core/setup/fixtures';
import { ChatAttachmentRendering } from './attachmentRendering';
import { Chat } from './chat';
import { ChatImagePaste } from './imagePaste';
import { Jumbomoji } from './jumbomoji';
import { Mention } from './mention';
import { MessageActions } from './messageActions';
import { ChatPluginDomElements } from './pluginDomElements';
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

  test('Pick a mention from the mention picker', async ({ browser, context, page }, testInfo) => {
    const mention = new Mention(browser, context);
    await mention.initPages(page, testInfo);
    await mention.pickMentionFromPicker();
  });

  test('No mention picker on a private chat', async ({ browser, context, page }, testInfo) => {
    const mention = new Mention(browser, context);
    await mention.initPages(page, testInfo);
    await mention.noPickerOnPrivateChat();
  });

  test('Mention survives a message edit', async ({ browser, context, page }, testInfo) => {
    const mention = new Mention(browser, context);
    await mention.initPages(page, testInfo);
    await mention.mentionSurvivesEdit();
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
        { tag: '@flaky' },
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

  // Needs markdownImageAllowed for the image body, like image paste.
  test.describe('Attachment rendering', { tag: imagePasteTags }, () => {
    test('Draw an image attachment as a full-width card with the text below', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const chat = new ChatAttachmentRendering(browser, context);
      await chat.init(page, testInfo);
      await chat.rendersImageCard();
    });

    test('Download an attachment from the message toolbar', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatAttachmentRendering(browser, context);
      await chat.init(page, testInfo);
      await chat.downloadsFromToolbar();
    });

    test('Draw a non-image attachment as a file row that downloads it', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const chat = new ChatAttachmentRendering(browser, context);
      await chat.init(page, testInfo);
      await chat.rendersFileRow();
    });

    test('Show the attachment in the reply and pinned previews', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatAttachmentRendering(browser, context);
      await chat.init(page, testInfo);
      await chat.showsAttachmentInPreviews();
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

    test('Reject a file whose bytes are not the image type it declares', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.rejectsSpoofedImageContent();
    });

    test('Reject an image above the dimension cap', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.rejectsImageExceedingDimensionCap();
    });

    test('Stage every file of the clipboard and send one message per file', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initPages(page, testInfo);
      await chat.stagesEveryFileAndSendsOneMessageEach();
    });

    test('Remove one of several staged files', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.removeOneOfSeveralFiles();
    });

    test('Attach a file with the file picker', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.attachWithFilePicker();
    });

    test('Drop a file on the chat panel', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.dropOnChatPanel();
    });

    test('Send a file that is not an image as a file row', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initPages(page, testInfo);
      await chat.sendNonImageFile();
    });

    test('Keep the image staged when the upload fails, and send it on retry', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.keepsImageStagedWhenUploadFails();
    });

    test('Strip an externally hosted image from a sent message', async ({ browser, context, page }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.dropsExternalImage();
    });

    test('Strip an external image nested in the alt text of another image', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const chat = new ChatImagePaste(browser, context);
      await chat.initModPage(page, { testInfo });
      await chat.dropsExternalImageNestedInAltText();
    });
  });
});

test.describe.parallel('Chat plugin dom elements', { tag: '@ci' }, () => {
  test('Keeps delivering dom elements after a message is deleted', async ({ browser, context, page }, testInfo) => {
    const domElements = new ChatPluginDomElements(browser, context);
    // Single-user scenarios: the probe, the deletion and the focus trap are all moderator-side
    await domElements.initModPage(page, { testInfo });
    await domElements.keepsDeliveringAfterMessageDeletion();
  });

  test('Keeps delivering dom elements after the keyboard focus re-mounts a message', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const domElements = new ChatPluginDomElements(browser, context);
    // Single-user scenarios: the probe, the deletion and the focus trap are all moderator-side
    await domElements.initModPage(page, { testInfo });
    await domElements.keepsDeliveringAfterKeyboardFocus();
  });
});
