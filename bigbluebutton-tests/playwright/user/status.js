const Page = require('../page');
const util = require('./util');
const elements = require('../elements');

class Status extends Page {

  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    
    await util.setStatus(this.page, elements.applaud);
    await this.page.waitForSelector(elements.applauseIcon);
    const applauseIconLocator = this.page.locator(elements.applauseIcon);
    await expect(applauseIconLocator).toBeVisible();

    await util.setStatus(this.page, elements.away);
    await this.page.waitForSelector(elements.awayIcon);
    const awayIconLocator = this.page.locator(elements.awayIcon);
    await expect(awayIconLocator).toBeVisible();
  }
}

exports.Status = Status;
