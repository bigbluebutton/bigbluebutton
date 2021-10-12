// Test: Sending a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Send extends Page {
  constructor() {
    super('chat-send');
  }

  async test(testName) {
    await util.openChat(this);

    // 0 messages
    const chat0 = await this.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length === 0);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `01-before-chat-message-send-[${this.meetingId}]`);
    }
    // send a message
    await this.type(e.chatBox, e.message);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `02-typing-chat-message-[${this.meetingId}]`);
    }
    await this.click(e.sendButton, true);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `03-after-chat-message-send-[${this.meetingId}]`);
    }

    // 1 message
    const chat1 = await this.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length === 1);
    return chat0 === chat1;
  }
}

module.exports = exports = Send;
