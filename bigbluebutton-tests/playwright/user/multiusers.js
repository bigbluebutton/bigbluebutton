const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');

class MultiUsers {
  constructor(browser, page1, page2) {
    this.modPage1 = new Page(browser, page1);
    this.modPage2 = new Page(browser, page2);
  }

  async init(testFolderName) {
    await this.modPage1.init(true, true, { fullName: 'Mod1' });
    await this.modPage2.init(true, true, { fullName: 'Mod2', meetingId: this.modPage1.meetingId }); // joining the same meeting
  }

  async userPresence() {
    const firstUserOnPage1 = this.modPage1.page.locator(e.firstUser);
    const secondUserOnPage1 = this.modPage1.page.locator(e.userListItem);
    const firstUserOnPage2 = this.modPage2.page.locator(e.firstUser);
    const secondUserOnPage2 = this.modPage2.page.locator(e.userListItem);
    await expect(firstUserOnPage1).toHaveCount(1);
    await expect(secondUserOnPage1).toHaveCount(1);
    await expect(firstUserOnPage2).toHaveCount(1);
    await expect(secondUserOnPage2).toHaveCount(1);
  }

  async whiteboardAccess() {
    await this.modPage1.waitForSelector(e.whiteboard);
    await this.modPage1.waitAndClick(e.userListItem);
    await this.modPage1.waitAndClick(e.changeWhiteboardAccess);
    await this.modPage1.waitForSelector(e.multiWhiteboardTool);
    const resp = await this.modPage1.page.evaluate((multiWhiteboardTool) => {
      return document.querySelector(multiWhiteboardTool).children[0].innerText === '1';
    }, e.multiWhiteboardTool);
    await expect(resp).toBeTruthy();
  }
}

exports.MultiUsers = MultiUsers;
