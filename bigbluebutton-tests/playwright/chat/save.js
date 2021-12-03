const Page = require('../core/page');
const { openChat } = require('./util');
const e = require('../core/elements');

class Save extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await openChat(this.page);
    await this.waitAndClick(e.chatOptions);
    await this.waitAndClick(e.chatSave);
    await this.page.waitForEvent('click');
  }
}

exports.Save = Save;
