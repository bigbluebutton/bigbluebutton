const Page = require('../page');
const util = require('./util');
const selectors = require('../selectors');

class Save extends Page {

  constructor(page, browser) {
    super(page, browser);
  }

  async test() {
    
    await util.openChat(this.page);
    await this.waitAndClick(selectors.chatOptions);
    await this.waitAndClick(selectors.chatSave);
    await this.page.waitForEvent('click');

  }
}

exports.Save = Save;