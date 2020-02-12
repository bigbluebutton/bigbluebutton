const Page = require('../core/page');
const params = require('../params');
const ule = require('./elements');

class MultiUsers {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
  }

  // Join BigBlueButton meeting
  async init(args, meetingId) {
    // Adding User2 username to params.js
    const paramsExtraUser = { fullName: 'User2' };
    this.params = { ...params, ...paramsExtraUser };

    await this.page1.init(args, meetingId, params);
    await this.page2.init(args, this.page1.meetingId, this.params);
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

  async test() {
    const checks = await this.checkForOtherUser(this.page1, this.page2);
    return checks.firstCheck !== false && checks.secondCheck !== false;
  }

  // Close all Pages
  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = MultiUsers;
