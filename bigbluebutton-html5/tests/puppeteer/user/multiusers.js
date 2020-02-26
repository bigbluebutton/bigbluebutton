const Page = require('../core/page');
const params = require('../params');
const util = require('../chat/util');

class MultiUsers {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, params);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' });
  }

  // Run the test for the page
  async checkForOtherUser() {
    const firstCheck = await this.page1.page.evaluate(() => document.querySelectorAll('[data-test="userListItem"]').length > 0);
    const secondCheck = await this.page2.page.evaluate(() => document.querySelectorAll('[data-test="userListItem"]').length > 0);
    return {
      firstCheck,
      secondCheck,
    };
  }

  async multiUsersPublicChat() {
    await util.sendPublicChatMessage(this.page1, this.page2);
    const responsePublicMessage = await util.checkForPublicMessageReception(this.page1, this.page2);
    const checkPublicChat = responsePublicMessage == true;
    return checkPublicChat == true;
  }

  async multiUsersPrivateChat() {
    await util.openPrivateChatMessage(this.page1, this.page2);
    await util.sendPrivateChatMessage(this.page1, this.page2);
    const responsePrivateMessage = await util.checkForPrivateMessageReception(this.page1, this.page2);
    const checkPrivateChat = responsePrivateMessage == true;
    return checkPrivateChat == true;
  }

  async test() {
    const checks = await this.checkForOtherUser();
    return checks.firstCheck !== false && checks.secondCheck !== false;
  }

  // Close all Pages
  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = MultiUsers;
