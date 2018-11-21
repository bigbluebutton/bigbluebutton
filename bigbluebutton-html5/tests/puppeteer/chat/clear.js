// Test: Cleaning a chat message

const Page = require('../page');
const helper = require('../helper');
const e = require('./elements');
const util = require('./util');

class Clear extends Page {
  async test() {
    await util.openChat(this);

    const messages0 = await util.getTestElements(this);

    await this.click(e.chatOptions);
    await this.click(e.chatClear, true);
    await this.screenshot('clear-chat.png', true);

    // TODO: this must change
    const messages1 = await util.getTestElements(this);

    console.log('\nChat messages before cleaning:');
    console.log(JSON.stringify(messages0, null, 2));
    console.log('\nChat messages after cleaning:');
    console.log(JSON.stringify(messages1, null, 2));
  }
}

module.exports = exports = Clear;
