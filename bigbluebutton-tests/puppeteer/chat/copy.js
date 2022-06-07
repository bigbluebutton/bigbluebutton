const Page = require('../core/page');
const e = require('../core/elements');
const p = require('../core/params');
const util = require('./util');

class Copy extends Page {
  constructor() {
    super();
  }

  async test(testName) {
    try {
      await util.openChat(this);
      await this.screenshot(`${testName}`, `01-before-sending-chat-message-[${this.meetingId}]`);

      // sending a message
      await this.type(e.chatBox, e.message);
      await this.waitAndClick(e.sendButton);
      await this.screenshot(`${testName}`, `02-chat-message-sent-[${this.meetingId}]`);

      await this.waitAndClick(e.chatOptions);
      await this.screenshot(`${testName}`, `03-chat-options-clicked-[${this.meetingId}]`);

      await this.waitForSelector(e.chatUserMessageText);
      await this.waitAndClick(e.chatCopy);
      // enable access to browser context clipboard
      const context = await this.browser.defaultBrowserContext();
      await context.overridePermissions(process.env.BBB_SERVER_URL, ['clipboard-read']);
      const copiedText = await this.page.evaluate(async () => navigator.clipboard.readText());
      return copiedText.includes(`${p.fullName}: ${e.message}`);
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Copy;
