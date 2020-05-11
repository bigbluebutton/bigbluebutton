const Page = require('../core/page');
const Create = require('./create');
const util = require('./util');
const e = require('./elements');

class Join extends Create {
  constructor() {
    super('join-breakout');
    this.page3 = new Page();
  }

  async join() {
    await this.joinWithUser2();
    await util.joinBreakoutRooms(this.page3);
  }

  async test() {
    const n = [(await this.page3.browser.pages()).length - 1];
    const page = (await this.page3.browser.pages())[n];
    const notificationBar = await page.evaluate(util.getTestElement, e.breakoutRemainingTime);
    const response = notificationBar !== null;
    return response;
  }

  async close() {
    await this.page1.close();
    await this.page2.close();
    await this.page3.close();
  }
}

module.exports = exports = Join;
