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
    const clicked = await this.page.addListener('click', () => document.addEventListener('click'));
    return clicked;
  }
}

module.exports = exports = Save;