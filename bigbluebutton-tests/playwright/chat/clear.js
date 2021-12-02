const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openChat } = require('./util');
const e = require('../core/elements');

class Clear extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await openChat(this.page);
    const message = this.page.locator(e.chatUserMessageText);
    
    // send a message
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
}

exports.Clear = Clear;
