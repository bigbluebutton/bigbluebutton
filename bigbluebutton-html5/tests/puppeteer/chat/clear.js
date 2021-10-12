// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');
const { chatPushAlerts } = require('../notifications/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class Clear extends Page {
  constructor() {
    super('chat-clear');
  }

  async test(testName) {
    try {
      await util.openChat(this);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `01-before-chat-message-send-[${this.meetingId}]`);
      }
      // sending a message
      await this.type(e.chatBox, e.message);
      await this.click(e.sendButton, true);

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `02-after-chat-message-send-[${this.meetingId}]`);
      }

      const chat0 = await this.page.evaluate(() => document.querySelectorAll('p[data-test="chatClearMessageText"]').length === 0);

      // clear
      await this.click(e.chatOptions, true);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `03-chat-options-clicked-[${this.meetingId}]`);
      }
      await this.click(e.chatClear, true);

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `04-chat-cleared-[${this.meetingId}]`);
      }

      const chatResp = await this.waitForSelector(e.chatClearMessageText, ELEMENT_WAIT_TIME).then(() => true);

      return chat0 && chatResp;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

module.exports = exports = Clear;
