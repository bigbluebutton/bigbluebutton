const Page = require('../core/page');
const e = require('../core/elements');
const p = require('../core/parameters');
const { openChat } = require('./util');
const { expect } = require('@playwright/test');

class Copy extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test(context) {
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
}

exports.Copy = Copy;
