// Test: Cleaning a chat message

const Page = require('../core/page');
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

    // TODO: Replace this with a download event listener
    await this.screenshot(true);
    await this.screenshot(true);
    await this.screenshot(true);

    // TODO: Check test
    return true;
  }
}

module.exports = exports = Save;
