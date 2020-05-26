// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Clear extends Page {
  constructor() {
    super('chat-clear');
  }

  async test() {
    await util.openChat(this);

    // sending a message
    await this.type(e.chatBox, e.message);
    await this.click(e.sendButton);
    await this.screenshot(true);

    // const before = await util.getTestElements(this);

    // 1 message
    const chat0 = await this.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);

    // clear
    await this.click(e.chatOptions);
    await this.click(e.chatClear, true);
    await this.screenshot(true);

    // const after = await util.getTestElements(this);

    // 1 message
    const chat1 = await this.page.$$(`${e.chatUserMessage} ${e.chatMessageText}`);

    expect(await chat0[0].evaluate(n => n.innerText)).toBe(e.message);

    const response = chat0.length === 1 && chat1.length === 0;

    return response;
  }
}

module.exports = exports = Clear;
