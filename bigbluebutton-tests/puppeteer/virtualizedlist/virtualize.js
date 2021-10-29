const Page = require('../core/page');
const { USER_LIST_VLIST_BOTS_LISTENING } = require('../core/constants');
const e = require('../core/elements');
const { getElementLength } = require('../core/util')

class VirtualizeList {
  constructor() {
    this.page1 = new Page();
    this.pagesArray = [];
  }

  // Join BigBlueButton meeting
  async init(testName) {
    try {
      await this.page1.init(true, true, testName, 'BroadCaster1');
      await this.page1.waitForSelector(e.anyUser);
      for (let i = 1; i <= parseInt(USER_LIST_VLIST_BOTS_LISTENING); i++) {
        const viewerPage = new Page();
        await viewerPage.init(false, true, testName, `Viewer${i}`, this.page1.meetingId);
        await this.pagesArray.push(viewerPage);

        await this.page1.getMetrics();
      }
      await this.page1.getMetrics();
    } catch (err) {
      await this.page1.logger(err);
    }
  }

  async test() {
    try {
      const USER_LIST_VLIST_VISIBLE_USERS = await this.page1.page.evaluate(getElementLength, e.anyUser);
      const totalNumberOfUsersMongo = await this.page1.page.evaluate(() => {
        const collection = require('/imports/api/users/index.js');
        return collection.default._collection.find().count();
      });
      if (USER_LIST_VLIST_VISIBLE_USERS === totalNumberOfUsersMongo) {
        return false;
      } if ((USER_LIST_VLIST_VISIBLE_USERS !== totalNumberOfUsersMongo) && (USER_LIST_VLIST_VISIBLE_USERS < totalNumberOfUsersMongo)) {
        return true;
      }
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async close() {
    try {
      this.page1.close();
      this.pagesArray.forEach(page => page.close());
    } catch (err) {
      await this.page1.logger(err);
    }
  }
}

module.exports = exports = VirtualizeList;