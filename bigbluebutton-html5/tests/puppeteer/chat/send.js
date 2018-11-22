// Test: Sending a chat message

const Page = require('../page');
const helper = require('../helper');
const e = require('./elements');
const util = require('./util');

class Send extends Page {
  async test() {
    await util.openChat(this);

    // Must be:
    // []
    const chat0 = await util.getTestElements(this);

    await this.type(e.chatBox, 'Hello world!');
    await this.click(e.sendButton);
    await this.screenshot('test-chat.png', true);

    // Must be:
    // [{ "name": "User1\nXX:XX XM", "message": "Hello world!" }]
    const chat1 = await util.getTestElements(this);

    const response =
      chat0.length == 0 &&
      chat1[0].message == 'Hello world!';

    return response;
  }
}

module.exports = exports = Send;
