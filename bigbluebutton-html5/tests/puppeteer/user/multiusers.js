const Page = require('../core/page');
const ule = require('./elements');

class MultiUsers extends Page {
  constructor() {
    super('multi-users');
  }

  async joinExtraUser(args) {
    this.context = await this.browser.createIncognitoBrowserContext(args);
    this.page = await this.context.newPage();
    await this.page.goto(this.joinURL);
  }

  async test() {
    await this.page.waitForSelector(ule.userListItem);
    const foundUser = await this.page.$$(async () => await document.querySelectorAll(`${ule.userListItem}:not([aria-label="You"])`).length > 0);
    return foundUser !== false;
  }
}

module.exports = exports = MultiUsers;
