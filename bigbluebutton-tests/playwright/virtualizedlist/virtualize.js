const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { USER_LIST_VLIST_BOTS_LISTENING } = require('../core/constants');

class VirtualizeList {
  constructor(browser, page) {
    this.page1 = new Page(browser, page);
    this.browser = browser;
    this.pagesArray = [];
  }

  // Join BigBlueButton meeting
  async init() {
    await this.page1.init(true, true, { fullName: 'BroadCaster1' });
    await this.page1.waitForSelector(e.firstUser);
    for (let i = 1; i <= parseInt(USER_LIST_VLIST_BOTS_LISTENING); i++) {
      const newPage = await this.browser.newPage();
      const viewerPage = new Page(this.browser, newPage);
      const fullName = `Viewer-${i}`;
      await viewerPage.init(false, true, { fullName, meetingId: this.page1.meetingId });

      console.log(`${fullName} joined`);
      this.pagesArray.push(viewerPage);
    }
  }

  async test() {
    const USER_LIST_VLIST_VISIBLE_USERS = await this.page1.getSelectorCount(e.userListItem);
    const totalNumberOfUsersMongo = await this.page1.page.evaluate(() => {
      const collection = require('/imports/api/users/index.js');
      return collection.default._collection.find().count();
    });
    await expect(USER_LIST_VLIST_VISIBLE_USERS).toBeLessThan(totalNumberOfUsersMongo);
  }
}

exports.VirtualizeList = VirtualizeList;
