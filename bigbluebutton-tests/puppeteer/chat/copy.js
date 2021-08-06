// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const p = require('../params');
const util = require('./util');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class Copy extends Page {
  constructor() {
    super('chat-copy');
  }

  async test(testName) {
    try {
      await util.openChat(this);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `01-before-sending-chat-message-[${this.meetingId}]`);
      }
      // sending a message
      await this.type(e.chatBox, e.message);
      await this.click(e.sendButton);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `02-chat-message-sent-[${this.meetingId}]`);
      }
      await this.click(e.chatOptions);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `03-chat-options-clicked-[${this.meetingId}]`);
      }
      await this.waitForSelector(e.chatUserMessageText, ELEMENT_WAIT_TIME);
      await this.click(e.chatCopy);
      // enable access to browser context clipboard
      const context = await this.browser.defaultBrowserContext();
      await context.overridePermissions(process.env.BBB_SERVER_URL, ['clipboard-read']);
      const copiedText = await this.page.evaluate(async () => await navigator.clipboard.readText());
      return copiedText.includes(`${p.fullName}: ${e.message}`);
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

module.exports = exports = Copy;
