// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');
const { chatPushAlerts } = require('../notifications/elements');

class Clear extends Page {
  constructor() {
    super('chat-clear');
  }

  async test() {
    await util.openChat(this);

    // sending a message
    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(true);
    }
    // const before = await util.getTestElements(this);

    // 1 message
    const chat0 = await this.page.evaluate(() => document.querySelectorAll('[data-test="chatUserMessage"]').length !== 0);

    // clear
    await this.click(e.chatOptions);
    await this.click(e.chatClear, true);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(true);
    }
    // const after = await util.getTestElements(this);

    // 1 message
    const chat1 = await this.page.evaluate(() => document.querySelectorAll('[data-test="chatUserMessage"]').length !== 0);

    const response = chat0 === false && chat1 === true;

    return response;
  }
}

module.exports = exports = Clear;
