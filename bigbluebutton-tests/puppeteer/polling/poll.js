const Page = require('../core/page');
const e = require('../core/elements');
const utilNotification = require('../notifications/util');
const { checkElementLengthEqualTo } = require('../core/util');

class Polling extends Page {
  constructor() {
    super('polling-test');
  }

  async test(testName) {
    try {
      await utilNotification.startPoll(this);
      await this.screenshot(`${testName}`, `01-before-chat-message-send-[${this.meetingId}]`);

      const resp = this.page.evaluate(checkElementLengthEqualTo, e.pollMenuButton, 1);
      return resp;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Polling;
