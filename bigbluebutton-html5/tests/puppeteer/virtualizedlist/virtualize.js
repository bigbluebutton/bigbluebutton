const Page = require('../core/page');
const params = require('../params');

class VirtualizeList {
  constructor() {
    this.page1 = new Page();
    this.pagesArray = [];
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    try {
      await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'BroadCaster1' });
      await this.page1.waitForSelector('[data-test^="userListItem"]');
      for (let i = 1; i <= parseInt(process.env.USER_LIST_VLIST_BOTS_LISTENING); i++) {
        const viewerPage = new Page();
        await viewerPage.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: `Viewer${i}`, moderatorPW: '' });
        await this.pagesArray.push(viewerPage);

        await this.page1.getMetrics();
      }
      await this.page1.getMetrics();
    } catch (e) {
      console.log(e);
    }
  }

  async test() {
    try {
      const USER_LIST_VLIST_VISIBLE_USERS = await this.page1.page.evaluate(async () => await document.querySelectorAll('[data-test^="userListItem"]').length);
      const totalNumberOfUsersMongo = await this.page1.page.evaluate(() => {
        const collection = require('/imports/api/users/index.js');
        const users = collection.default._collection.find({ connectionStatus: 'online' }).count();
        return users;
      });
      if (USER_LIST_VLIST_VISIBLE_USERS === totalNumberOfUsersMongo) {
        return false;
      } if ((USER_LIST_VLIST_VISIBLE_USERS !== totalNumberOfUsersMongo) && (USER_LIST_VLIST_VISIBLE_USERS < totalNumberOfUsersMongo)) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async close() {
    try {
      this.page1.close();
      this.pagesArray.forEach(page => page.close());
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = exports = VirtualizeList;
