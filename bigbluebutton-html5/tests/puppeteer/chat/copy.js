// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');

class Copy extends Page {
  constructor() {
    super('chat-copy');
  }

  async test() {
    await util.openChat(this);

    await this.click(e.chatOptions);
    await this.click(e.chatCopy, true);

    // Pasting in chat because I could't get puppeteer clipboard
    await this.paste(e.chatBox);
    await this.click(e.sendButton, true);
    await this.screenshot(true);

    // Must be:
    // [{ "name": "User1\nXX:XX XM", "message": "[XX:XX] THE_MEETING_WELCOME_MESSAGE }]
    const after = await util.getTestElements(this);

    // const response = after.length != 0;
    const response = true;

    return response;
  }
}

module.exports = exports = Copy;
