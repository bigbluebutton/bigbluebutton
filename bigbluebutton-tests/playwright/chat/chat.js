const { expect, default: test } = require('@playwright/test');
const { openPublicChat, openPrivateChat, checkLastMessageSent } = require('./util');
const p = require('../core/parameters');
const e = require('../core/elements');
const { checkTextContent } = require('../core/util');
const { getSettings } = require('../core/settings');
const { MultiUsers } = require('../user/multiusers');
const { sleep } = require('../core/helpers');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Chat extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async sendPublicMessage() {
    await openPublicChat(this.modPage);
    await this.modPage.checkElementCount(e.chatUserMessageText, 0, 'should have none message on the public chat');

    await this.modPage.type(e.chatBox, e.message);
    await this.userPage.hasElement(e.typingIndicator, 'should display the typing indicator element');
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.checkElementCount(e.chatUserMessageText, 1, 'should have on message on the public chat');
  }

  async sendPrivateMessage() {
    await openPrivateChat(this.modPage);
    await this.modPage.hasElement(e.hidePrivateChat, 'should display the hide private chat element when opening a private chat');
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
    await this.modPage.type(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.waitUntilHaveCountSelector(e.chatButton, 2);
    await this.userPage.waitAndClickElement(e.chatButton, 1);
    await this.userPage.hasElement(e.hidePrivateChat, 'should display the hide private chat element when opening a private chat');
    // check sent messages 
    await this.modPage.hasText(e.chatUserMessageText, e.message1, 'should display the message sent by the moderator');
    await this.userPage.hasText(e.chatUserMessageText, e.message1, 'should display the message sent by the moderator for the attende');
    // userPage send message
    await this.userPage.type(e.chatBox, e.message2);
    await this.modPage.hasElement(e.typingIndicator, 'should display the typing indicator for the moderator');
    await this.userPage.waitAndClick(e.sendButton);
    // check sent messages 
    await this.modPage.hasText(`${e.chatUserMessageText}>>nth=1`, e.message2, 'should display the message "Hello User1" for the moderator');
    await this.userPage.hasText(`${e.chatUserMessageText}>>nth=1`, e.message2, 'should display the message "Hello User1" for the moderator');

    await this.modPage.waitAndClick(e.chatButton);
    await this.userPage.waitAndClick(e.chatButton);
  }

  async clearChat() {
    await openPublicChat(this.modPage);

    const userMessageTextCount = await this.modPage.getSelectorCount(e.chatUserMessageText);

    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display a message sent by the moderator');

    // 1 message
    await this.modPage.checkElementCount(e.chatUserMessageText, userMessageTextCount + 1, 'should display one message');

    // clear
    await this.modPage.waitAndClick(e.chatOptions);
    await this.modPage.waitAndClick(e.chatClear);
    await this.modPage.hasText(e.chatUserMessageText, 'The public chat history was cleared by a moderator', 'should display the message where the chat has been cleared');
  }

  async copyChat() {
    const { publicChatOptionsEnabled } = getSettings();

    await openPublicChat(this.modPage);

    if(!publicChatOptionsEnabled) {
      await this.modPage.waitAndClick(e.chatOptions);
      await this.modPage.hasElement(e.chatClear, 'should display the option to clear the chat');
      return this.modPage.wasRemoved(e.chatCopy, 'should not display the option to copy the chat');
    }
    // sending a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.waitAndClick(e.chatOptions);

    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator');
    await this.modPage.waitAndClick(e.chatCopy);
    // enable access to browser context clipboard
    const copiedText = await this.modPage.getCopiedText(this.modPage.context);
    const check = copiedText.includes(`${p.fullName}: ${e.message}`);
    await expect(check, 'should display on the copied chat the same message that was sent on the public chat').toBeTruthy();
  }

  async saveChat(testInfo) {
    const { publicChatOptionsEnabled } = getSettings();

    await openPublicChat(this.modPage);
    if(!publicChatOptionsEnabled) {
      await this.modPage.waitAndClick(e.chatOptions);
      return this.modPage.wasRemoved(e.chatSave, 'chat save option should not be displayed');
    }

    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await this.modPage.waitAndClick(e.chatOptions);
    const chatSaveLocator = this.modPage.getLocator(e.chatSave);
    const { content } = await this.modPage.handleDownload(chatSaveLocator, testInfo);

    const dataToCheck = [
      this.modPage.meetingId,
      this.modPage.username,
      e.message,
    ];
    await checkTextContent(content, dataToCheck, 'should display the same message on the saved chat message and the message sent on the public chat');
  }

  async characterLimit() {
    await openPublicChat(this.modPage);

    const { maxMessageLength } = getSettings();
    const initialMessagesCount = await this.modPage.getSelectorCount(e.chatUserMessageText);
    await this.modPage.page.fill(e.chatBox, e.uniqueCharacterMessage.repeat(maxMessageLength));
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message text sent by the user on the public chat');
    await this.modPage.checkElementCount(e.chatUserMessageText, initialMessagesCount + 1);

    await this.modPage.page.fill(e.chatBox, e.uniqueCharacterMessage.repeat(maxMessageLength));
    await this.modPage.type(e.chatBox, '123');  // it should has no effect
    await this.modPage.hasElement(e.errorTypingIndicator, 'Should appear the warning message below the chat box');
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.checkElementCount(e.chatUserMessageText, initialMessagesCount + 2);
  }

  async emptyMessage() {
    await openPublicChat(this.modPage);

    const userMessageTextCount = await this.modPage.getSelectorCount(e.chatUserMessageText);

    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.checkElementCount(e.chatUserMessageText, userMessageTextCount);
  }

  async copyPastePublicMessage() {
    await this.modPage.type(e.chatBox, 'test');
    await this.modPage.waitAndClick(e.sendButton);
    await checkLastMessageSent(this.modPage, /test/);

    const text = await this.modPage.getLocator(e.chatUserMessageText).last().boundingBox();

    await this.modPage.mouseDoubleClick(text.x, text.y);
    await this.modPage.press('Control+KeyC');
    await this.modPage.getLocator(e.chatBox).focus();
    await this.modPage.press('Control+KeyV');
    await this.modPage.type(e.chatBox, '2');
    await this.modPage.waitAndClick(e.sendButton);

    await checkLastMessageSent(this.modPage, /test2/);
  }

  async sendEmoji() {
    const { emojiPickerEnabled } = getSettings();

    await openPublicChat(this.modPage);
    if(!emojiPickerEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.wasRemoved(e.emojiPickerButton);
    }

    const message = this.modPage.getLocator(e.chatUserMessageText);
    await expect(message).toHaveCount(0);

    await this.modPage.waitAndClick(e.emojiPickerButton);
    await this.modPage.waitAndClick(e.emojiSent);
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.waitForSelector(e.chatUserMessageText);
    await expect(message).toHaveCount(1);
  }

  async emojiCopyChat(context) {
    const { emojiPickerEnabled } = getSettings();

    await openPublicChat(this);
    if(!emojiPickerEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.wasRemoved(e.emojiPickerButton);
    }
    await this.waitAndClick(e.emojiPickerButton);
    await this.waitAndClick(e.emojiSent);
    await this.waitAndClick(e.sendButton);

    await this.waitAndClick(e.chatOptions);

    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatCopy);

    const copiedText = await this.getCopiedText(context);
    const check = copiedText.includes(`${p.fullName}: ${e.frequentlyUsedEmoji}`);
    await expect(check).toBeTruthy();
  }

  async closePrivateChat() {
    await openPrivateChat(this.modPage);
    await this.modPage.waitUntilHaveCountSelector(e.chatButton, 2);
    const privateChatLocator = this.modPage.getLocatorByIndex(e.chatButton, -1);
    expect(privateChatLocator).toContainText(this.userPage.username);

    const chatMessageCount = await this.modPage.getSelectorCount(e.chatUserMessageText);

    await this.modPage.hasElement(e.hidePrivateChat);
    await this.modPage.hasElement(e.closePrivateChat);
    await this.modPage.checkElementCount(e.chatUserMessageText, chatMessageCount);
    await this.modPage.type(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.waitUntilHaveCountSelector(e.chatButton, 2);
    await this.modPage.waitAndClick(e.closePrivateChat);
    await this.modPage.wasRemoved(e.hidePrivateChat);
    await this.modPage.waitUntilHaveCountSelector(e.chatButton, 1, ELEMENT_WAIT_LONGER_TIME);
    const userChatCount = await this.userPage.getSelectorCount(e.chatButton);
    await this.modPage.waitAndClick(e.chatButton);
    expect(userChatCount).toBe(2);
  }

  async emojiSaveChat(testInfo) {
    const { emojiPickerEnabled } = getSettings();

    await openPublicChat(this.modPage);
    if(!emojiPickerEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.wasRemoved(e.emojiPickerButton);
    }
    await this.modPage.waitAndClick(e.emojiPickerButton);
    await this.modPage.waitAndClick(e.emojiSent);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.waitAndClick(e.chatOptions);
    const chatSaveLocator = this.modPage.getLocator(e.chatSave);
    const { content } = await this.modPage.handleDownload(chatSaveLocator, testInfo);

    const dataToCheck = [
      this.modPage.meetingId,
      this.modPage.username,
      e.frequentlyUsedEmoji,
    ];
    await checkTextContent(content, dataToCheck);
  }

  async emojiSendPrivateChat() {
    const { emojiPickerEnabled } = getSettings();

    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
    if(!emojiPickerEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.wasRemoved(e.emojiPickerButton);
    }
    await this.modPage.waitAndClick(e.emojiPickerButton);
    await this.modPage.waitAndClick(e.emojiSent);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.waitUntilHaveCountSelector(e.chatButton, 2);
    await this.userPage.waitAndClickElement(e.chatButton, 1);
    await this.userPage.waitForSelector(e.hidePrivateChat);
    // check sent messages 
    await this.modPage.hasText(e.chatUserMessageText, e.frequentlyUsedEmoji);
    await this.userPage.hasText(e.chatUserMessageText, e.frequentlyUsedEmoji);
    // userPage send message
    await this.userPage.waitAndClick(e.emojiPickerButton);
    await this.userPage.waitAndClick(e.emojiSent);
    await this.userPage.waitAndClick(e.sendButton);
    // check sent messages 
    await this.modPage.hasText(e.privateChat, e.frequentlyUsedEmoji);
    await this.userPage.hasText(e.privateChat, e.frequentlyUsedEmoji);

    await this.modPage.waitAndClick(e.chatButton);
  }

  async autoConvertEmojiPublicChat() {
    const { autoConvertEmojiEnabled } = getSettings();

    try {
      await this.modPage.hasElement(e.hidePrivateChat);
      await this.modPage.waitAndClick(e.chatButton);
    } catch {
      await this.modPage.hasElement(e.hidePublicChat);
    }

    await this.modPage.waitAndClick(e.chatOptions);
    await this.modPage.waitAndClick(e.chatClear);

    await this.modPage.checkElementCount(e.chatUserMessageText, 1);

    await this.modPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.modPage.waitAndClick(e.sendButton);

    if(!autoConvertEmojiEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.hasText(`${e.chatUserMessageText}>>nth=1`, ":)");
    }

    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.checkElementCount(e.chatUserMessageText, 2);
  }

  async autoConvertEmojiCopyChat(context) {
    const { autoConvertEmojiEnabled } = getSettings();

    await openPublicChat(this);
    await this.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.waitAndClick(e.sendButton);
    if(!autoConvertEmojiEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.hasText(`${e.chatUserMessageText}>>nth=1`, ":)");
    }
    await this.waitAndClick(e.chatOptions);

    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatCopy);

    const copiedText = await this.getCopiedText(context);
    const check = copiedText.includes(`${p.fullName}: ${e.convertedEmojiMessage}`);
    await expect(check).toBeTruthy();
  }

  async autoConvertEmojiSaveChat(testInfo) {
    const { autoConvertEmojiEnabled } = getSettings();

    await openPublicChat(this.modPage);
    await this.modPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.modPage.waitAndClick(e.sendButton);
    if(!autoConvertEmojiEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.hasText(`${e.chatUserMessageText}>>nth=1`, ':)');
    }
    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.waitAndClick(e.chatOptions);
    const chatSaveLocator = this.modPage.getLocator(e.chatSave);
    const { content } = await this.modPage.handleDownload(chatSaveLocator, testInfo);

    const dataToCheck = [
      this.modPage.meetingId,
      this.modPage.username,
      e.convertedEmojiMessage,
    ];
    await checkTextContent(content, dataToCheck);
  }

  async autoConvertEmojiSendPrivateChat() {
    const { autoConvertEmojiEnabled, emojiPickerEnabled } = getSettings();

    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
    await this.modPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.modPage.waitAndClick(e.sendButton);
    if(!autoConvertEmojiEnabled && !emojiPickerEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.hasText(`${e.chatUserMessageText}>>nth=0`, ":)");
    } else if (!autoConvertEmojiEnabled) {
      await this.modPage.hasElement(e.chatBox);
      return this.modPage.hasText(`${e.chatUserMessageText}>>nth=2`, ":)");
    }
    await this.userPage.waitUntilHaveCountSelector(e.chatButton, 2);
    await this.userPage.waitAndClickElement(e.chatButton, 1);
    await this.userPage.waitForSelector(e.hidePrivateChat);
    // check sent messages
    await checkLastMessageSent(this.modPage, e.convertedEmojiMessage)
    await checkLastMessageSent(this.userPage, e.convertedEmojiMessage);
    // userPage send message
    await this.userPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.userPage.waitAndClick(e.sendButton);
    // check sent messages 
    const lastMessageLocator = await this.modPage.getLocator(e.chatUserMessageText).last();
    await expect(lastMessageLocator).toHaveText(e.convertedEmojiMessage);
    const lastMessageLocatorUser = await this.userPage.getLocator(e.chatUserMessageText).last()
    await expect(lastMessageLocatorUser).toHaveText(e.convertedEmojiMessage);
  }

  async chatDisabledUserLeaves() {
    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.sendButton);
    await this.userPage.logoutFromMeeting();
    await this.modPage.hasElement(e.partnerDisconnectedMessage, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.sendButton);
  }  
}

exports.Chat = Chat;
