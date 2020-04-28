const Page = require('../core/page');
const params = require('../params');
const util = require('../audio/util');

class VirtualizeList {
  constructor() {
    this.page1 = new Page();
    this.page3 = new Page();
    this.pagesArray = [];
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    try {
      console.log('init page1')
      await this.page1.init(Page.getArgsWithAudio(), meetingId, { ...params, fullName: 'BroadCaster1' });
      await this.page1.closeAudioModal();
      console.log('init page3')
      await this.page3.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: 'Probe' });
      await this.page3.closeAudioModal();
      console.log('getting first metrics');
      await this.page3.getMetrics();
      for (let i = 1; i <= parseInt(process.env.USER_LIST_VLIST_BOTS_LISTENING); i++) {
        const viewerPage = new Page();
        console.log('Viewers initialization')
        await viewerPage.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: `Viewer${i}`, moderatorPW: '' });
        this.pagesArray.push(viewerPage);
        await viewerPage.closeAudioModal();
        console.log('getting metrics with Viewers')
        await this.page3.getMetrics();
      }
    } catch (e) {
      console.log(e);
    }
  }

  test() {
    console.log('getting test result')
    await this.page1.page.evaluate((room) => {
      const numberOfUserPromise = new Promise((resolve) => {
        const checkNumberOfUser = setInterval(() => {
          const users = document.querySelectorAll('div[class^="participantsList"]').length;
          if (users === parseInt(process.env.USER_LIST_VLIST_BOTS_LISTENING)) {
            resolve(clearInterval(checkNumberOfUser));
          }
        }, 1000);
      });
      return numberOfUserPromise;
    });
  }

  async close() {
    this.page1.close();
    this.page3.close();
    this.pagesArray.forEach(page => page.close());
  }
}

module.exports = exports = VirtualizeList;
