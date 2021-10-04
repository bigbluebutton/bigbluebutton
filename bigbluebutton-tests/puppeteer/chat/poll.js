const Notifications = require('../notifications/notifications');
const e = require('../core/elements');
const { checkElementLengthEqualTo } = require('../core/util');

class Poll extends Notifications {
  constructor() {
    super();
  }

  async test(testName) {
    try {
      // 0 messages
      const chat0 = await this.page3.page.evaluate(checkElementLengthEqualTo, e.chatPollMessageText, 0);
      await this.page3.screenshot(`${testName}`, `01-before-chat-message-send-[${this.page3.meetingId}]`);

      await this.publishPollResults(testName);

      await this.page3.waitAndClick(e.chatButton);
      await this.page3.waitForSelector(e.chatPollMessageText);

      // 1 message
      const chat1 = await this.page3.page.evaluate(checkElementLengthEqualTo, e.chatPollMessageText, 1);
      return chat0 === chat1;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }
}

module.exports = exports = Poll;
