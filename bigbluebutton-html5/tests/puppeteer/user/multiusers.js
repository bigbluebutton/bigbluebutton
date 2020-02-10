const Page = require('../core/page');
const ule = require('./elements');
const params = require('../params');
const helper = require('../core/helper');

class MultiUsers extends Page {
  constructor() {
    super('multi-users', 'params2');
  }

  async joinExtraUser(args) {
    this.params2 = { fullName: 'User2' };
    this.params = { ...params, ...this.params2 };
    this.context = await this.browser.createIncognitoBrowserContext(args);
    this.page = await this.context.newPage();
    const joinURL = helper.getJoinURL(this.meetingId, this.params, true);
    await this.page.goto(joinURL);
  }

  async test() {
    await this.page.waitForSelector(ule.userListItem);
    const foundUser = await this.page.$$(async () => await document.querySelectorAll(`${ule.userListItem}:not([aria-label="You"])`).length > 0);
    return foundUser !== false;
  }
}

module.exports = exports = MultiUsers;
