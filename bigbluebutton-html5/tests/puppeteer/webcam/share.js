const Page = require('../core/page');
const util = require('./util');
const params = require('../params');

class Share {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
  }

  async init(meetingId) {
    await this.page1.init(Page.getArgsWithVideo(), meetingId, { ...params, fullName: 'Streamer1' });
    await this.page2.init(Page.getArgsWithVideo(), this.page1.meetingId, { ...params, fullName: 'Streamer2' });
  }

  async test() {
    await util.enableWebcam(this.page1);
    await util.enableWebcam(this.page2);
    const responseUser1 = await util.evaluateCheck(this.page1);
    const responseUser2 = await util.evaluateCheck(this.page2);
    return responseUser1 && responseUser2;
  }

  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = Share;
