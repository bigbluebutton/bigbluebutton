const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openChat } = require('./util');
const e = require('../core/elements');

class EmptyMessage extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await openChat(this.page);
    const messageLocator = this.page.locator(e.chatUserMessageText);

    await this.waitAndClick(e.sendButton);
    await expect(messageLocator).toHaveCount(0);
  }
}

exports.EmptyMessage = EmptyMessage;
