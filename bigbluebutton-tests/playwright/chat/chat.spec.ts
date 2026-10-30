import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Chat } from './chat';
import { Jumbomoji } from './jumbomoji';
import { MessageActions } from './messageActions';
import { MessageRendering } from './messageRendering';
import { ChatPluginDomElements } from './pluginDomElements';
import { PrivateChatListPreview } from './privateChatListPreview';
import { ReadConfirmation } from './readConfirmation';
import { EMOJI_PICKER_SETTINGS_OVERRIDE } from './util';

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

  test('Verify character limit', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.characterLimit();
  });

  test('Late joiner loads older messages by scrolling up', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initModPage(page, { testInfo });
    await chat.lateJoinerLoadsOlderMessages();
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

  test('Send emoji on public chat using emoji picker', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initModPage(page, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.initUserPage(context, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.sendEmoji();
  });

  test('Copy chat with emoji', { tag: '@nightly' }, async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
    const chat = new Chat(browser, context);
    await chat.initModPage(page, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.initUserPage(context, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
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

  test('Save chat with emoji', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initModPage(page, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.initUserPage(context, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.emojiSaveChat();
  });

  test('Send emoji on private chat', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initModPage(page, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.initUserPage(context, { testInfo, clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE });
    await chat.emojiSendPrivateChat();
  });

  test('Send auto converted emoji on public chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.autoConvertEmojiPublicChat();
  });

  test('Escape auto converted emoji with a backslash on public chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.autoConvertEmojiEscapePublicChat();
  });

  test(
    'Copy chat with auto converted emoji',
    { tag: '@nightly' },
    async ({ browser, context, page, browserName }, testInfo) => {
      test.skip(browserName === 'firefox', 'Firefox does not support clipboard-write and clipboard-read');
      const chat = new Chat(browser, context);
      await chat.initPages(page, testInfo);
      await chat.autoConvertEmojiCopyChat();
    },
  );

  test('Auto convert emoji save chat', { tag: '@nightly' }, async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.autoConvertEmojiSaveChat();
  });

  test(
    'Send auto converted emoji on private chat',
    { tag: '@nightly' },
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

  test('Presenter change is announced in public chat', async ({ browser, context, page }, testInfo) => {
    const chat = new Chat(browser, context);
    await chat.initPages(page, testInfo);
    await chat.presenterChangeAnnouncement();
  });

  test('Jumbomoji renders emoji-only messages with larger font', async ({ browser, context, page }, testInfo) => {
    const jumbomoji = new Jumbomoji(browser, context);
    await jumbomoji.initModPage(page, { testInfo });
    await jumbomoji.verifyJumbomoji();
  });

  test('Private message read check does not overlap the message time on hover', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    linkIssue(25936);
    const readConfirmation = new ReadConfirmation(browser, context);
    await readConfirmation.initModPage(page, {
      testInfo,
      clientSettingsOverrides: { public: { chat: { privateMessageReadFeedback: { enabled: true } } } },
    });
    await readConfirmation.initUserPage(context, { testInfo });
    await readConfirmation.verifyReadCheckDoesNotOverlapMessageTime();
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

  test.describe('Message rendering', () => {
    test('Markdown formatting is rendered for the receiver', async ({ browser, context, page }, testInfo) => {
      const rendering = new MessageRendering(browser, context);
      await rendering.initPages(page, testInfo);
      await rendering.markdownFormatting();
    });

    test('HTML and script payloads are displayed as text for the receiver', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const rendering = new MessageRendering(browser, context);
      await rendering.initPages(page, testInfo);
      await rendering.htmlPayloadsRenderAsText();
    });

    test('Image markdown is not rendered as an image', async ({ browser, context, page }, testInfo) => {
      const rendering = new MessageRendering(browser, context);
      await rendering.initPages(page, testInfo);
      await rendering.imageMarkdownNotRendered();
    });
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

      test('User can delete only his own messages in breakout rooms', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.breakoutsModDelete();
      });
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

    test.describe('Pin', () => {
      test('Moderator pins and unpins a message for everyone', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.pinAndUnpinMessage();
      });

      test('Viewer cannot pin a message', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initPages(page, testInfo);
        await message.viewerCannotPinMessage();
      });

      test('Pin message button is removed by disabledFeatures', async ({ browser, context, page }, testInfo) => {
        const message = new MessageActions(browser, context);
        await message.initModPage(page, { createParameter: 'disabledFeatures=pinChatMessage', testInfo });
        await message.pinMessageDisabled();
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
