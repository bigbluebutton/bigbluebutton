// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Clear extends Page {
  constructor() {
    super('chat-clear');
  }

  async test() {
    await util.openChat(this);

    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    await this.screenshot(true);

    // Must be:
    // [{ "name": "User1\nXX:XX XM", "message": "Hello world!" }]
    const before = await util.getTestElements(this);

    await this.click(e.chatOptions);
    await this.click(e.chatClear, true);
    await this.screenshot(true);

    // Must be:
    // []
    const after = await util.getTestElements(this);

    const response = before[0].message == e.message
      && after.length == 0;

    return response;
  }
}

module.exports = exports = Clear;
