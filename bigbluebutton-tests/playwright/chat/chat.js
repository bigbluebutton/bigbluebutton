const { expect, default: test } = require('@playwright/test');
const { openChat, openPrivateChat, checkLastMessageSent } = require('./util');
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
    await openChat(this.modPage);
    await this.modPage.checkElementCount(e.chatUserMessageText, 0);

    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.checkElementCount(e.chatUserMessageText, 1);
  }

  async sendPrivateMessage() {
    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
    await this.modPage.type(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.waitUntilHaveCountSelector(e.chatButton, 2);
    await this.userPage.waitAndClickElement(e.chatButton, 1);
    await this.userPage.waitForSelector(e.hidePrivateChat);
    // check sent messages 
    await this.modPage.hasText(e.chatUserMessageText, e.message1);
    await this.userPage.hasText(e.chatUserMessageText, e.message1);
    // userPage send message
    await this.userPage.type(e.chatBox, e.message2);
    await this.userPage.waitAndClick(e.sendButton);
    // check sent messages 
    await this.modPage.hasText(e.privateChat, e.message2);
    await this.userPage.hasText(e.privateChat, e.message2);

    await this.modPage.waitAndClick(e.chatButton);
    await this.userPage.waitAndClick(e.chatButton);
  }

  async clearChat() {
    await openChat(this.modPage);

    const userMessageTextCount = await this.modPage.getSelectorCount(e.chatUserMessageText);

    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitForSelector(e.chatUserMessageText);

    // 1 message
    await this.modPage.checkElementCount(e.chatUserMessageText, userMessageTextCount + 1);

    // clear
    await this.modPage.waitAndClick(e.chatOptions);
    await this.modPage.waitAndClick(e.chatClear);
    const clearMessage = this.modPage.getLocator(e.chatClearMessageText);
    await expect(clearMessage).toBeVisible();

  }

  async copyChat(context) {
    const { publicChatOptionsEnabled } = getSettings();
    test.fail(!publicChatOptionsEnabled, 'Public chat options (save and copy) are disabled');

    await openChat(this.modPage);
    // sending a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.waitAndClick(e.chatOptions);

    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.waitAndClick(e.chatCopy);
    // enable access to browser context clipboard
    const copiedText = await this.modPage.getCopiedText(context);
    const check = copiedText.includes(`${p.fullName}: ${e.message}`);
    await expect(check).toBeTruthy();
  }

  async saveChat(testInfo) {
    const { publicChatOptionsEnabled } = getSettings();
    test.fail(!publicChatOptionsEnabled, 'Public chat options (save and copy) are disabled');

    await openChat(this.modPage);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.waitAndClick(e.chatOptions);
    const chatSaveLocator = this.modPage.getLocator(e.chatSave);
    const { content } = await this.modPage.handleDownload(chatSaveLocator, testInfo);

    const dataToCheck = [
      this.modPage.meetingId,
      this.modPage.username,
      e.message,
    ];
    await checkTextContent(content, dataToCheck);
  }

  async characterLimit() {
    await openChat(this.modPage);

    const { maxMessageLength } = getSettings();
    await this.modPage.page.fill(e.chatBox, e.uniqueCharacterMessage.repeat(maxMessageLength));
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.checkElementCount(e.chatUserMessageText, 1);

    await this.modPage.page.fill(e.chatBox, e.uniqueCharacterMessage.repeat(maxMessageLength + 1));
    await this.modPage.waitForSelector(e.typingIndicator);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.checkElementCount(e.chatUserMessageText, 1);
  }

  async emptyMessage() {
    await openChat(this.modPage);

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
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.hasText(e.secondChatUserMessageText, /test/);
  }

  async sendEmoji() {
    const { emojiPickerEnabled } = getSettings();
    test.fail(!emojiPickerEnabled, 'Emoji Picker is disabled');

    await openChat(this.modPage);
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
    test.fail(!emojiPickerEnabled, 'Emoji Picker is disabled');

    await openChat(this);
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
    test.fail(!emojiPickerEnabled, 'Emoji Picker is disabled');

    await openChat(this);
    await this.waitAndClick(e.emojiPickerButton);
    await this.waitAndClick(e.emojiSent);
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatOptions);
    const chatSaveLocator = this.getLocator(e.chatSave);
    const { content } = await this.handleDownload(chatSaveLocator, testInfo);

    const dataToCheck = [
      this.meetingId,
      this.username,
      e.frequentlyUsedEmoji,
    ];
    await checkTextContent(content, dataToCheck);
  }

  async emojiSendPrivateChat() {
    const { emojiPickerEnabled } = getSettings();
    test.fail(!emojiPickerEnabled, 'Emoji Picker is disabled');

    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
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
    test.fail(!autoConvertEmojiEnabled, 'Auto Convert Emoji is disabled');

    try {
      await this.modPage.hasElement(e.hidePrivateChat);
      await this.modPage.waitAndClick(e.chatButton);
    } catch {
      await this.modPage.hasElement(e.publicChat);
    }

    const message = await this.modPage.getSelectorCount(e.chatUserMessageText);
    await this.modPage.checkElementCount(e.chatUserMessageText, message);

    await this.modPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitForSelector(e.chatUserMessageText);
    await this.modPage.checkElementCount(e.chatUserMessageText, message + 1);
  }

  async autoConvertEmojiCopyChat(context) {
    const { autoConvertEmojiEnabled } = getSettings();
    test.fail(!autoConvertEmojiEnabled, 'Auto Convert Emoji is disabled');

    await openChat(this);
    await this.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.waitAndClick(e.sendButton);

    await this.waitAndClick(e.chatOptions);

    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatCopy);

    const copiedText = await this.getCopiedText(context);
    const check = copiedText.includes(`${p.fullName}: ${e.convertedEmojiMessage}`);
    await expect(check).toBeTruthy();
  }

  async autoConvertEmojiSaveChat(testInfo) {
    const { autoConvertEmojiEnabled } = getSettings();
    test.fail(!autoConvertEmojiEnabled, 'Auto Convert Emoji is disabled');

    await openChat(this.modPage);
    await this.modPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.modPage.waitAndClick(e.sendButton);
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
    const { autoConvertEmojiEnabled } = getSettings();
    test.fail(!autoConvertEmojiEnabled, 'Auto Convert Emoji is disabled');

    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
    await this.modPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.waitUntilHaveCountSelector(e.chatButton, 2);
    await openPrivateChat(this.userPage);
    await this.userPage.waitForSelector(e.hidePrivateChat);
    // check sent messages
    await checkLastMessageSent(this.modPage, e.convertedEmojiMessage)
    await checkLastMessageSent(this.userPage, e.convertedEmojiMessage);
    // userPage send message
    await this.userPage.type(e.chatBox, e.autoConvertEmojiMessage);
    await this.userPage.waitAndClick(e.sendButton);
    // check sent messages 
    await this.modPage.hasText(e.privateChat, e.convertedEmojiMessage);
    await this.userPage.hasText(e.privateChat, e.convertedEmojiMessage);
  }

  async chatDisabledUserLeaves() {
    await openPrivateChat(this.modPage);
    await this.modPage.waitForSelector(e.sendButton);
    await this.userPage.waitAndClick(e.optionsButton);
    await this.userPage.waitAndClick(e.logout);
    await this.modPage.hasElementDisabled(e.chatBox);
    await this.modPage.hasElementDisabled(e.sendButton);
  }  
}

exports.Chat = Chat;
