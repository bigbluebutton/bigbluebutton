// Test: Cleaning a chat message

const Page = require('../page');
const helper = require('../helper');
const e = require('./elements');
const util = require('./util');

class Copy extends Page {
  async test() {
    await util.openChat(this);

    await this.click(e.chatOptions);
    await this.click(e.chatCopy, true);
    await this.click(e.chatBox);

    // Pasting in chat because I could't get puppeteer clipboard
    await this.page.keyboard.down('ControlLeft');
    await this.page.keyboard.press('KeyV');
    await this.page.keyboard.up('ControlLeft');
    await this.click(e.sendButton, true);
    await this.screenshot('copy-chat.png', true);

    // Must be:
    // [{ "name": "User1\nXX:XX XM", "message": "[XX:XX] THE_MEETING_WELCOME_MESSAGE }]
    const chat = await util.getTestElements(this);

    const response = chat.length != 0;

    return response;
  }
}

module.exports = exports = Copy;
