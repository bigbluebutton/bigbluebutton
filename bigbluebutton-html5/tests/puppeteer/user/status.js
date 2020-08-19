const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Status extends Page {
  constructor() {
    super('user-status');
  }

  async test() {
    // TODO: Check this if it's open before click
    // await this.click(ce.userList);

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

    // status0 and status3 are equal as initial and last status
    return status0 !== status1 && status1 !== status2 && status2 !== status3 && status2 !== status0 && status3 !== status1;
  }
}

module.exports = exports = Status;
