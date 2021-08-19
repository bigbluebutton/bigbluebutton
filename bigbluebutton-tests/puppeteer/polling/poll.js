const Page = require('../core/page');
const e = require('../core/elements');
const utilNotification = require('../notifications/util');

class Polling extends Page {
  constructor() {
    super('polling-test');
  }

  async test(testName) {
    try {
      await utilNotification.startPoll(this);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `01-before-chat-message-send-[${this.meetingId}]`);
      }
      const resp = this.page.evaluate((pollMenuSelector) => {
        return document.querySelectorAll(pollMenuSelector).length === 1;
      }, e.pollMenuButton);
      return resp;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

module.exports = exports = Polling;
