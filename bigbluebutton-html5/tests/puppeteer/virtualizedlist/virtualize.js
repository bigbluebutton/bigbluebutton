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
      await this.page1.init(Page.getArgsWithAudio(), meetingId, { ...params, fullName: 'BroadCaster1' });
      await this.page1.closeAudioModal();
      await this.page3.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: 'Probe' });
      await this.page3.closeAudioModal();
      await this.page3.getMetrics();
      for (let i = 1; i <= parseInt(process.env.BOTS); i++) {
        const viewerPage = new Page();
        await viewerPage.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: `Viewer${i}`, moderatorPW: '' });
        this.pagesArray.push(viewerPage);
        await viewerPage.closeAudioModal();
        await this.page3.getMetrics();
      }
    } catch (e) {
      console.log(e);
    }
  }

  test() {
    new Promise(
      (resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 20000);
      },
    );
  }

  async close() {
    this.page1.close();
    this.page3.close();
    this.pagesArray.forEach(page => page.close());
  }
}

module.exports = exports = VirtualizeList;
