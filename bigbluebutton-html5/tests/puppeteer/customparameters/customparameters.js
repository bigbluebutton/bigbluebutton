const Page = require('../core/page');
const params = require('../params');
const cpe = require('./elements');
const util = require('./util');

class CustomParameters {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
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

  async listenOnlyMode(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    await this.page2.init(args, this.page1.meetingId, { ...params, fullName: 'Attendee', moderatorPW: '' }, customParameter);
    console.log('after init');
    if (await this.page1.page.$('[data-test="audioModalHeader"]')) {
      return false;
    }
    await this.page1.page.waitFor(cpe.echoTestYesButton);
    await this.page2.page.waitFor(cpe.echoTestYesButton);
    const resp1 = await util.listenOnlyMode(this.page1);
    const resp2 = await util.listenOnlyMode(this.page2);
    console.log({ resp1, resp2 });
    return resp1 === true && resp2 === true;
  }

  async closePage(page) {
    page.close();
  }

  async close(page1, page2) {
    page1.close();
    page2.close();
  }
}

module.exports = exports = CustomParameters;
