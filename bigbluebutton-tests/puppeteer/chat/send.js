const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const { checkElementLengthEqualTo } = require('../core/util');

class Send extends Page {
  constructor() {
    super();
  }

  async test(testName) {
    try {
      await util.openChat(this);

      // 0 messages
      const chat0 = await this.page.evaluate(checkElementLengthEqualTo, e.chatUserMessageText, 0);
      await this.screenshot(`${testName}`, `01-before-chat-message-send-[${this.meetingId}]`);

      // send a message
      await this.type(e.chatBox, e.message);
      await this.screenshot(`${testName}`, `02-typing-chat-message-[${this.meetingId}]`);

      await this.waitAndClick(e.sendButton);
      await this.screenshot(`${testName}`, `03-after-chat-message-send-[${this.meetingId}]`);

      await this.waitForSelector(e.chatUserMessageText);

      // 1 message
      const chat1 = await this.page.evaluate(checkElementLengthEqualTo, e.chatUserMessageText, 1);
      return chat0 === chat1;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Send;
