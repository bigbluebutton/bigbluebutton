const { expect } = require('@playwright/test');
const Page = require('../page');
const util = require('./util');
const selectors = require('../selectors');

class Send extends Page {

  constructor(page, browser) {
    super(page, browser);
  }

  async test() {
    
    await util.openChat(this.page);
    const message = this.page.locator(selectors.chatUserMessageText);
  
    // 0 messages
    await expect(message).toHaveCount(0);
    
    // send a message
    await this.type(selectors.chatBox, selectors.message);
    await this.waitAndClick(selectors.sendButton);
    await this.page.waitForSelector(selectors.chatUserMessageText);
  
    // 1 message
    await expect(message).toHaveCount(1);
  }
}

exports.Send = Send;