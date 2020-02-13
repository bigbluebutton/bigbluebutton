// Test: Sending a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Send extends Page {
  constructor() {
    super('chat-send');
  }

  async test() {
    await util.openChat(this);

    // const chat0 = await util.getTestElements(this);

    // 0 messages
    const chat0 = await this.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);

    // send a message
    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    await this.screenshot(true);

    // const chat1 = await util.getTestElements(this);

    // 1 message
    const chat1 = await this.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);

    expect(await chat1[0].evaluate(n => n.innerText)).toBe(e.message);

    const response = chat0.length === 0 && chat1.length === 1;

    return response;
  }
}

module.exports = exports = Send;
