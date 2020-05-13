const Page = require('../core/page');
const params = require('../params');
const cpe = require('./elements');
const util = require('./util');

class CustomParameters {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  async autoJoin(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    console.log('after init');
    await this.page1.waitForSelector('div[class^="spinner--"]', { timeout: 5000 });
    console.log('after spinner');
    await this.page1.waitForSelector(cpe.whiteboard, { timeout: 5000 });
    const resp = await util.autoJoinTest(this.page1);
    console.log(resp, 'response');
    return resp;
  }

  async closePage(page) {
    page.close();
  }

  async close(page1, page2, page3) {
    page1.close();
    page2.close();
    page3.close();
  }
}

module.exports = exports = CustomParameters;
