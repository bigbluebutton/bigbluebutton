const Page = require('../core/page');
const params = require('../params');
const util = require('../audio/util');

class VirtualizeList {
  constructor() {
    this.page1 = new Page();
    this.pagesArray = [];
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    try {
      console.log('page1 :: init');
      await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'BroadCaster1' });
      this.page1.page.on('console', (msg) => {
        for (let i = 0; i < msg.args().length; ++i) console.log(`${i}: ${msg.args()[i]}`);
      });
      console.log('page1 :: Waiting for user list item ( begin )');
      await this.page1.waitForSelector('[data-test^="userListItem"]');
      console.log('page1 :: Waiting for user list item ( end )');
      console.log('page1 :: getting first metrics (begin)');
      await this.page1.getMetrics();
      console.log('page1 ::getting first metrics (end)');
      for (let i = 1; i <= parseInt(process.env.USER_LIST_VLIST_BOTS_LISTENING); i++) {
        const viewerPage = new Page();
        console.log('Viewers initialization');
        await viewerPage.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: `Viewer${i}`, moderatorPW: '' });
        console.log(`User${i} joined !`);
        await this.pagesArray.push(viewerPage);

        console.log(`Viewer${i} :: getting metrics ( begin )`);
        await this.page1.getMetrics();
        console.log(`Viewer${i} :: getting metrics ( end )`);
      }
      await this.page1.getMetrics();
    } catch (e) {
      console.log(e);
    }
  }

  test() {
    console.log('getting test result');
    const vbot = process.env.USER_LIST_VLIST_BOTS_LISTENING;
    return this.page1.page.evaluate((vbot) => {
      const numberOfUserPromise = new Promise((resolve) => {
        const checkNumberOfUser = setInterval(() => {
          const users = document.querySelectorAll('div[class^="participantsList"]').length;
          console.log('users length', users, moment(Date.now()).format('DD/MM/YYYY hh:mm:ss'));
          if (users === parseInt(vbot) + 1) {
            clearInterval(checkNumberOfUser);
            resolve(users);
          }
        }, 1000);
      });
      return numberOfUserPromise;
    }, vbot);
  }

  async close() {
    this.page1.close();
    this.pagesArray.forEach(page => page.close());
  }
}

module.exports = exports = VirtualizeList;
