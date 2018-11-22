// Test: Cleaning a chat message

const Page = require('../page');
const e = require('./elements');
const util = require('./util');

class Save extends Page {
  constructor() {
    super('chat-save');
  }

  async test() {
    await util.openChat(this);

    await this.click(e.chatOptions);
    await this.click(e.chatSave, true);

    await this.screenshot(true);
    await this.screenshot(true);
    await this.screenshot(true);

    return true;
  }
}

module.exports = exports = Save;
