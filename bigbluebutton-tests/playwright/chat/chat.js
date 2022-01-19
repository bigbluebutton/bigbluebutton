const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openChat } = require('./util');
const p = require('../core/parameters');
const e = require('../core/elements');

class Chat extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async sendPublicMessage() {
    await openChat(this.page);
    const message = this.page.locator(e.chatUserMessageText);
    await expect(message).toHaveCount(0);

    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);
    await this.page.waitForSelector(e.chatUserMessageText);
    await expect(message).toHaveCount(1);
  }

  async clearChat() {
    await openChat(this.page);
    const message = this.page.locator(e.chatUserMessageText);

    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);
    await this.page.waitForSelector(e.chatUserMessageText);

    // 1 message
    await expect(message).toHaveCount(1);

    // clear
    await this.waitAndClick(e.chatOptions);
    await this.waitAndClick(e.chatClear);
    const clearMessage = this.page.locator(e.chatClearMessageText);
    await expect(clearMessage).toBeVisible();
  }

  async copyChat(context) {
    await openChat(this);

    // sending a message
    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);

    await this.waitAndClick(e.chatOptions);

    await this.waitForSelector(e.chatUserMessageText);
    await this.waitAndClick(e.chatCopy);
    // enable access to browser context clipboard
    await context.grantPermissions(['clipboard-write', 'clipboard-read'], { origin: process.env.BBB_SERVER_URL });
    const copiedText = await this.page.evaluate(async () => navigator.clipboard.readText());
    const check = copiedText.includes(`${p.fullName}: ${e.message}`);
    expect(check).toBeTruthy();
  }

  async saveChat() {
    await openChat(this.page);
    await this.waitAndClick(e.chatOptions);
    await this.waitAndClick(e.chatSave);
    await this.page.waitForEvent('click');
  }

  async characterLimit() {
    await openChat(this.page);
    const messageLocator = this.page.locator(e.chatUserMessageText);

    await this.type(e.chatBox, e.longMessage5000);
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);
    await expect(messageLocator).toHaveCount(1);

    await this.type(e.chatBox, e.longMessage5001);
    await this.waitForSelector(e.typingIndicator);
    await this.waitAndClick(e.sendButton);
    await this.waitForSelector(e.chatUserMessageText);
    await expect(messageLocator).toHaveCount(1);
  }

  async emptyMessage() {
    await openChat(this.page);
    const messageLocator = this.getLocator(e.chatUserMessageText);

    await this.waitAndClick(e.sendButton);
    await expect(messageLocator).toHaveCount(0);
  }
}

exports.Chat = Chat;