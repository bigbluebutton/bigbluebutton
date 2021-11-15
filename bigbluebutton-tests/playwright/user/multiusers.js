const { expect } = require('@playwright/test');
const Page = require('../page');
const elements = require('../elements');

class MultiUsers {

  constructor(browser, page1, page2) {
    this.page1 = new Page(browser, page1);
    this.page2 = new Page(browser, page2);
  }

  async init(testFolderName) {
    await this.page1.init(true, true, 'User1');
    await this.page2.init(true, true, 'User2', this.page1.meetingId); // joining the same meeting
  }

  async test() {
    const firstUserOnPage1 = this.page1.page.locator(elements.firstUser);
    const secondUserOnPage1 = this.page1.page.locator(elements.userListItem);
    const firstUserOnPage2 = this.page2.page.locator(elements.firstUser);
    const secondUserOnPage2 = this.page2.page.locator(elements.userListItem);
    await expect(firstUserOnPage1).toHaveCount(1);
    await expect(secondUserOnPage1).toHaveCount(1);
    await expect(firstUserOnPage2).toHaveCount(1);
    await expect(secondUserOnPage2).toHaveCount(1);
  }
}

exports.MultiUsers = MultiUsers;
