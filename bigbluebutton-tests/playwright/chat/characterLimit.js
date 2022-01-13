const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openChat } = require('./util');
const e = require('../core/elements');

class CharacterLimit extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await openChat(this.page);
    const messageLocator = this.page.locator(e.chatUserMessageText);

    await this.type(e.chatBox, e.longMessage5000);
    await this.waitAndClick(e.sendButton);
    await this.page.waitForSelector(e.chatUserMessageText);
    await expect(messageLocator).toHaveCount(1);

    await this.type(e.chatBox, e.longMessage5001);
    await this.page.waitForSelector(e.typingIndicator);
    await this.waitAndClick(e.sendButton);
    await this.page.waitForSelector(e.chatUserMessageText);
    await expect(messageLocator).toHaveCount(1);
  }
}

exports.CharacterLimit = CharacterLimit;
