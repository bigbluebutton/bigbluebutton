const Page = require('../page');
const util = require('./util');
const selectors = require('../selectors');

class Status extends Page {

  constructor(page, browser) {
    super(page, browser);
  }

  async test() {
    
    await util.setStatus(this.page, selectors.applaud);
    await this.page.waitForSelector(selectors.applauseIcon);
    const applauseIconLocator = this.page.locator(selectors.applauseIcon);
    await expect(applauseIconLocator).toBeVisible();

    await util.setStatus(this.page, selectors.away);
    await this.page.waitForSelector(selectors.awayIcon);
    const awayIconLocator = this.page.locator(selectors.awayIcon);
    await expect(awayIconLocator).toBeVisible();
  }
}

exports.Status = Status;
