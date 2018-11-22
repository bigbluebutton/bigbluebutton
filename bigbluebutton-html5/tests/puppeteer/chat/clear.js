// Test: Cleaning a chat message

const Page = require('../page');
const helper = require('../helper');
const e = require('./elements');
const util = require('./util');

class Clear extends Page {
  async test() {
    await util.openChat(this);

    await this.type(e.chatBox, 'Hello world!');
    await this.click(e.sendButton);
    await this.screenshot('clear-chat0.png', true);

    // Must be:
    // [{ "name": "User1\nXX:XX XM", "message": "Hello world!" }]
    const chat0 = await util.getTestElements(this);

    await this.click(e.chatOptions);
    await this.click(e.chatClear, true);
    await this.screenshot('clear-chat1.png', true);

    // Must be:
    // []
    const chat1 = await util.getTestElements(this);

    const response =
      chat0[0].message == 'Hello world!' &&
      chat1.length == 0;

    return response;
  }
}

module.exports = exports = Clear;
