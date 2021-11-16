const { expect } = require('@playwright/test');
const Page = require('../page');
const util = require('./util');
const elements = require('../elements');

class Clear extends Page {

  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    
    await util.openChat(this.page);
    const message = this.page.locator(elements.chatUserMessageText);
    
    // send a message
    await this.type(elements.chatBox, elements.message);
    await this.waitAndClick(elements.sendButton);
    await this.page.waitForSelector(elements.chatUserMessageText);
  
    // 1 message
    await expect(message).toHaveCount(1);

    // clear
    await this.waitAndClick(elements.chatOptions);
    await this.waitAndClick(elements.chatClear);
    const clearMessage = this.page.locator(elements.chatClearMessageText);
    await expect(clearMessage).toBeVisible();
  }
}

exports.Clear = Clear;
