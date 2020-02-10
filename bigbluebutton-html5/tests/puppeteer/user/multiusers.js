const Page = require('../core/page');
const ule = require('./elements');
const params = require('../params');
const helper = require('../core/helper');

class MultiUsers extends Page {
  constructor() {
    super('multi-users', 'paramsExtraUser');
  }

  // Join BigBlueButton meeting as User2
  async initilize(args) {
    const paramsExtraUser = { fullName: 'User2' };
    this.params = { ...params, ...paramsExtraUser };
    this.ctx = await this.browser.createIncognitoBrowserContext(args);
    const page = await this.ctx.newPage();
    const joinURL = helper.getJoinURL(this.meetingId, this.params, true);
    await page.goto(joinURL);
  }

  // Run the test for the page
  async checkForOtherUser() {
    await this.page.waitForSelector(ule.userListItem);
    const foundUser = await this.page.$$(async () => await document.querySelectorAll(`${ule.userListItem}:not([aria-label="You"])`).length > 0);
    return foundUser !== false;
  }

  // Close all Pages
  async close() {
    const pages = await Promise.all([1, 2].map(() => this.browser, this.ctx));
    await Promise.all(pages.map(p => p.close()));
  }
}

module.exports = exports = MultiUsers;
