const { ELEMENT_WAIT_TIME } = require('../core/constants');
const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Status extends Page {
  constructor() {
    super('user-status');
  }

  async test() {
    await util.setStatus(this, e.applaud);
    const resp1 = await this.page.evaluate(util.countTestElements, 'div[data-test="userAvatar"] > div > i[class="icon-bbb-applause"]');
    await util.setStatus(this, e.away);
    const resp2 = await this.page.evaluate(util.countTestElements, 'div[data-test="userAvatar"] > div > i[class="icon-bbb-time"]');

    await this.click(e.firstUser, true);
    await this.waitForSelector(e.clearStatus, ELEMENT_WAIT_TIME);
    await this.click(e.clearStatus, true);
    return resp1 === resp2;
  }
}

module.exports = exports = Status;
