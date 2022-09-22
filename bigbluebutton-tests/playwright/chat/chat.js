const { expect, default: test } = require('@playwright/test');
const Page = require('../core/page');
const { openChat } = require('./util');
const p = require('../core/parameters');
const e = require('../core/elements');
const { checkTextContent } = require('../core/util');
const { getSettings } = require('../core/settings');

class Chat extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async sendPublicMessage() {
    await openChat(this);
    await this.checkElementCount(e.chatUserMessageText, 0);

    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);
    await this.checkElementCount(e.chatUserMessageText, 1);
  }

  async clearChat() {
    await openChat(this);

    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);

    // 1 message
    await this.checkElementCount(e.chatUserMessageText, 1);

    // clear
    await this.waitAndClick(e.chatOptions);
    await this.waitAndClick(e.chatClear);
    const clearMessage = this.getLocator(e.chatClearMessageText);
    await expect(clearMessage).toBeVisible();
  }

  async copyChat(context) {
    const { publicChatOptionsEnabled } = getSettings();
    test.fail(!publicChatOptionsEnabled, 'Public chat options (save and copy) are disabled');

    await openChat(this);
    // sending a message
    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);

    await this.waitAndClick(e.chatOptions);

    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatCopy);
    // enable access to browser context clipboard
    await context.grantPermissions(['clipboard-write', 'clipboard-read'], { origin: process.env.BBB_URL });
    const copiedText = await this.page.evaluate(async () => navigator.clipboard.readText());
    const check = copiedText.includes(`${p.fullName}: ${e.message}`);
    expect(check).toBeTruthy();
  }

  async saveChat(testInfo) {
    const { publicChatOptionsEnabled } = getSettings();
    test.fail(!publicChatOptionsEnabled, 'Public chat options (save and copy) are disabled');

    await openChat(this);
    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatOptions);
    const { content } = await this.handleDownload(e.chatSave, testInfo);

    const dataToCheck = [
      this.meetingId,
      this.username,
      e.message,
    ];
    await checkTextContent(content, dataToCheck);
  }

  async characterLimit() {
    await openChat(this);

    const { maxMessageLength } = getSettings();
    await this.page.fill(e.chatBox, e.uniqueCharacterMessage.repeat(maxMessageLength));
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);
    await this.checkElementCount(e.chatUserMessageText, 1);

    await this.page.fill(e.chatBox, e.uniqueCharacterMessage.repeat(maxMessageLength + 1));
    await this.waitForSelector(e.typingIndicator);
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);
    await this.checkElementCount(e.chatUserMessageText, 1);
  }

  async emptyMessage() {
    await openChat(this);

    await this.waitAndClick(e.sendButton);
    await this.checkElementCount(e.chatUserMessageText, 0);
  }
}

exports.Chat = Chat;
