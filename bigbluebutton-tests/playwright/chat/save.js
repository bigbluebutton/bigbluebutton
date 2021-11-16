const Page = require('../page');
const util = require('./util');
const elements = require('../elements');

class Save extends Page {

  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    
    await util.openChat(this.page);
    await this.waitAndClick(elements.chatOptions);
    await this.waitAndClick(elements.chatSave);
    await this.page.waitForEvent('click');

  }
}

exports.Save = Save;
