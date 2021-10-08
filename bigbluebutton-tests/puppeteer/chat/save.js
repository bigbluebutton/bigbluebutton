const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');

class Save extends Page {
  constructor() {
    super();
  }

  async test(testName) {
    try {
      await util.openChat(this);
      await this.screenshot(`${testName}`, `01-before-chat-options-click-[${this.meetingId}]`);

      await this.waitAndClick(e.chatOptions);
      await this.screenshot(`${testName}`, `02-chat-options-clicked-[${this.meetingId}]`);

      await this.waitAndClick(e.chatSave);
      let clicked = '';
      clicked = await this.page.addListener('click', () => document.addEventListener('click'));
      return clicked !== '';
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Save;
