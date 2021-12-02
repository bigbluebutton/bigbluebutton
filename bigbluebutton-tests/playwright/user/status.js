const Page = require('../core/page');
const { setStatus } = require('./util');
const e = require('../core/elements');

class Status extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await setStatus(this.page, e.applaud);
    await this.page.waitForSelector(e.applauseIcon);
    const applauseIconLocator = this.page.locator(e.applauseIcon);
    await expect(applauseIconLocator).toBeVisible();

    await setStatus(this.page, e.away);
    await this.page.waitForSelector(e.awayIcon);
    const awayIconLocator = this.page.locator(e.awayIcon);
    await expect(awayIconLocator).toBeVisible();
  }
}

exports.Status = Status;
