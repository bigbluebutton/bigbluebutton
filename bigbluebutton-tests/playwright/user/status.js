const Page = require('../core/page');
const { setStatus } = require('./util');
const e = require('../core/elements');
const { clearNotification } = require('../notifications/util');

class Status extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await setStatus(this, e.applaud);
    await this.waitForSelector(e.smallToastMsg);
    await this.checkElement(e.applauseIcon);

    await clearNotification(this);
    await setStatus(this, e.away);
    await this.waitForSelector(e.smallToastMsg);
    await this.checkElement(e.awayIcon);
  }
}

exports.Status = Status;
