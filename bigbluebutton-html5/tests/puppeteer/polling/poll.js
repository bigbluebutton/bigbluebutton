const Page = require('../core/page');
const utilNotification = require('../notifications/util');
const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

class Polling extends Page {
  constructor() {
    super('polling-test');
  }

  async test() {
    try {
      await utilNotification.startPoll(this);
      const resp = this.page.evaluate(() => document.querySelectorAll('[data-test="pollMenuButton"]').length === 1);
      return resp;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

module.exports = exports = Polling;
