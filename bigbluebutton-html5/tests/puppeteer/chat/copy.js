// Test: Cleaning a chat message

const clipboardy = require('clipboardy');
const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Copy extends Page {
  constructor() {
    super('chat-copy');
  }

  async test() {
    await util.openChat(this);

    // sending a message
    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    await this.screenshot(true);

    await this.click(e.chatOptions);
    await this.click(e.chatCopy, true);

    const copiedChat = clipboardy.readSync();
    expect(copiedChat).toEqual(expect.stringContaining(`User1 : ${e.message}`));

    return true;
  }
}

module.exports = exports = Copy;
