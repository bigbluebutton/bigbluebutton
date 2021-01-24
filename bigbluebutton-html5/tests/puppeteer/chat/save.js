// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Save extends Page {
  constructor() {
    super('chat-save');
  }

  async test(testName) {
    await util.openChat(this);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `01-before-chat-options-click-[${testName}]`);
    }
    await this.click(e.chatOptions);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `02-chat-options-clicked-[${testName}]`);
    }
    await this.click(e.chatSave, true);
    let clicked = '';
    clicked = await this.page.addListener('click', () => document.addEventListener('click'));
    return clicked !== '';
  }
}

module.exports = exports = Save;
