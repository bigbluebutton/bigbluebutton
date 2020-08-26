// Test: Cleaning a chat message

const clipboardy = require('clipboardy');
const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Copy extends Page {
  constructor() {
    super('chat-copy');
  }

  async test(testName) {
    await util.openChat(this);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `01-before-sending-chat-message-[${testName}]`);
    }
    // sending a message
    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `02-chat-message-sent-[${testName}]`);
    }
    await this.click(e.chatOptions);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `03-chat-options-clicked-[${testName}]`);
    }
    await this.click(e.chatCopy, true);

    // enable access to browser context clipboard
    const context = await this.browser.defaultBrowserContext();
    await context.overridePermissions(process.env.BBB_SERVER_URL, ['clipboard-read']);
    const copiedText = await this.page.evaluate(async () => await navigator.clipboard.readText());
    return copiedText.includes(`User1 : ${e.message}`);
  }
}

module.exports = exports = Copy;
