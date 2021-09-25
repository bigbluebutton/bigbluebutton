const Page = require('../core/page');
const params = require('../params');
const { USER_LIST_VLIST_BOTS_LISTENING } = require('../core/constants');
const e = require('../core/elements');
const { getElementLength } = require('../core/util')

class VirtualizeList {
  constructor() {
    this.page1 = new Page();
    this.pagesArray = [];
  }

  // Join BigBlueButton meeting
  async init(meetingId, testName) {
    try {
      await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'BroadCaster1' }, undefined, testName);
      await this.page1.closeAudioModal();
      await this.page1.waitForSelector(e.anyUser);
      for (let i = 1; i <= parseInt(USER_LIST_VLIST_BOTS_LISTENING); i++) {
        const viewerPage = new Page();
        await viewerPage.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: `Viewer${i}`, moderatorPW: '' }, undefined, testName);
        await viewerPage.closeAudioModal();
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
        const users = collection.default._collection.find().count();
        return users;
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
