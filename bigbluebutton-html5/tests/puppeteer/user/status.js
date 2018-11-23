const Page = require('../core/page');
const e = require('./elements');
const ce = require('../core/elements');
const util = require('./util');

class Status extends Page {
  constructor() {
    super('user-status');
  }

  async test() {
    // TODO: Check this if it's open before click
    await this.click(ce.userList);

    await this.screenshot(true);
    const status0 = await util.getTestElements(this);

    await util.setStatus(this, e.applaud);

    await this.screenshot(true);
    const status1 = await util.getTestElements(this);

    await util.setStatus(this, e.away);

    await this.screenshot(true);
    const status2 = await util.getTestElements(this);

    await this.click(e.firstUser);
    await this.click(e.clearStatus, true);

    await this.screenshot(true);
    const status3 = await util.getTestElements(this);

    // TODO: Check test
    return true;
  }
}

module.exports = exports = Status;
