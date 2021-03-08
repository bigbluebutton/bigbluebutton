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
  async init(meetingId, testFolderName) {
    await this.page1.init(Page.getArgs(), meetingId, params, undefined, testFolderName);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' }, undefined, testFolderName);
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
    const chat0 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    await util.sendPublicChatMessage(this.page1, this.page2);
    const chat1 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    return chat0 !== chat1;
  }

  async multiUsersPrivateChat() {
    await util.openPrivateChatMessage(this.page1, this.page2);
    const chat0 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    await util.sendPrivateChatMessage(this.page1, this.page2);
    const chat1 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    return chat0 !== chat1;
  }

  async test() {
    const checks = await this.checkForOtherUser();
    return checks.firstCheck !== false && checks.secondCheck !== false;
  }

  // Close all Pages
  async close(page1, page2) {
    await page1.close();
    await page2.close();
  }

  async closePage(page) {
    await page.close();
  }
}

module.exports = exports = MultiUsers;
