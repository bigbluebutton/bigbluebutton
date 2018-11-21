// Test: Sending a chat message

const Page = require('../page');
const helper = require('../helper');
const e = require('./elements');
const util = require('./util');

class Send extends Page {
  async test() {
    await util.openChat(this);

    const messages0 = await util.getTestElements(this);

    await this.type(e.chatBox, 'Hello world!');
    await this.click(e.sendButton);
    await this.screenshot('test-chat.png', true);

    const messages1 = await util.getTestElements(this);

    console.log('\nChat messages before posting:');
    console.log(JSON.stringify(messages0, null, 2));
    console.log('\nChat messages after posting:');
    console.log(JSON.stringify(messages1, null, 2));
  }
}

module.exports = exports = Send;
