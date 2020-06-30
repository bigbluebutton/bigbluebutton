const Page = require('../core/page');
const Create = require('./create');
const util = require('./util');
const e = require('./elements');
const pe = require('../core/elements');

class Join extends Create {
  constructor() {
    super('join-breakout');
  }

  // Join Existing Breakoutrooms
  async join(testName) {
    await this.joinWithUser3();
    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.closeAudioModal();
    await this.page3.screenshot(`${testName}`, `02-page03-closed-audioModal-${testName}`);
    await this.page3.waitForSelector(e.breakoutRoomsItem);
    await this.page3.page.evaluate(util.clickTestElement, e.breakoutRoomsItem);
    await this.page3.screenshot(`${testName}`, `03-page03-breakoutrooms-list-visualization-${testName}`);
    await this.page3.waitForSelector(e.breakoutJoin);
    await this.page3.page.evaluate(util.clickTestElement, e.breakoutJoin);
    await this.page3.screenshot(`${testName}`, `04-page03-joined-breakoutrooms-${testName}`);
  }

  // Check if User Joined in Breakoutrooms
  async testJoined(testName) {
    const resp = await this.page2.page.evaluate(util.getTestElement, e.userJoined);
    if (resp === true) {
      await this.page2.screenshot(`${testName}`, `05-page03-success-${testName}`);
      return true;
    }
    await this.page2.screenshot(`${testName}`, `05-page03-fail-${testName}`);
    return false;
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
    await this.page3.close();
  }
}

module.exports = exports = Join;
