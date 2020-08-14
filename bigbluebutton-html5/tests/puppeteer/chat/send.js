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
    const chat0 = await this.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `01-before-chat-message-send-[${testName}]`);
    }
    // send a message
    await this.type(e.chatBox, e.message);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `02-typing-chat-message-[${testName}]`);
    }
    await this.click(e.sendButton);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `03-after-chat-message-send-[${testName}]`);
    }

    // 1 message
    const chat1 = await this.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);
    const response = chat0.length === 0 && chat1.length === 1;

    return response;
  }
}

module.exports = exports = Send;
