const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { checkElementLengthEqualTo } = require('../core/util');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class PrivateChat extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async sendPrivateMessage() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.startPrivateChat);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    await sleep(500); // prevent a race condition when running on a deployed server
    // modPage send message
    await this.modPage.type(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.page.waitForFunction(
      checkElementLengthEqualTo,
      [e.chatButton, 2],
      { timeout: ELEMENT_WAIT_TIME },
    );
    await this.userPage.waitAndClickElement(e.chatButton, 1);
    await this.userPage.waitForSelector(e.hidePrivateChat);
    // check sent messages 
    await this.modPage.hasText(e.chatUserMessageText, e.message1);
    await this.userPage.hasText(e.chatUserMessageText, e.message1);
    // userPage send message
    await this.userPage.type(e.chatBox, e.message2);
    await this.userPage.waitAndClick(e.sendButton);
    // check sent messages 
    await this.modPage.hasText(e.privateChat, e.message2);
    await this.userPage.hasText(e.privateChat, e.message2);
  }
}

exports.PrivateChat = PrivateChat; 
