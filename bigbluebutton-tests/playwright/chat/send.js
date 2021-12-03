const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openChat } = require('./util');
const e = require('../core/elements');

class Send extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await openChat(this.page);
    const message = this.page.locator(e.chatUserMessageText);

    // 0 messages
    await expect(message).toHaveCount(0);

    // send a message
    await this.type(e.chatBox, e.message);
    await this.waitAndClick(e.sendButton);
    await this.page.waitForSelector(e.chatUserMessageText);

    // 1 message
    await expect(message).toHaveCount(1);
  }
}

exports.Send = Send;
