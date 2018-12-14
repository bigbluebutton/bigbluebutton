// Test: Sending a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Send extends Page {
  constructor() {
    super('chat-send');
  }

  async test() {
    await util.openChat(this);

    // Must be:
    // []
    const chat0 = await util.getTestElements(this);

    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    await this.screenshot(true);

    // Must be:
    // [{ "name": "User1\nXX:XX XM", "message": "Hello world!" }]
    const chat1 = await util.getTestElements(this);

    const response = chat0.length == 0
      && chat1[0].message == e.message;

    return response;
  }
}

module.exports = exports = Send;
