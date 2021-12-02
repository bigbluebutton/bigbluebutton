const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');

class MultiUsers {
  constructor(browser, context) {
    this.browser = browser;
    this.context = context;
  }

  async initPages(page1) {
    await this.initModPage(page1);
    await this.initUserPage();
  }

  async initModPage(page) {
    this.modPage = new Page(this.browser, page);
    await this.modPage.init(true, true, { fullName: 'Moderator' });
  }

  async initUserPage() {
    const page = await this.context.newPage();
    this.userPage = new Page(this.browser, page);
    await this.userPage.init(false, true, { fullName: 'Attendee', meetingId: this.modPage.meetingId });
  }

  async userPresence() {
    const firstUserOnPage1 = this.modPage.page.locator(e.firstUser);
    const secondUserOnPage1 = this.modPage.page.locator(e.userListItem);
    const firstUserOnPage2 = this.userPage.page.locator(e.firstUser);
    const secondUserOnPage2 = this.userPage.page.locator(e.userListItem);
    await expect(firstUserOnPage1).toHaveCount(1);
    await expect(secondUserOnPage1).toHaveCount(1);
    await expect(firstUserOnPage2).toHaveCount(1);
    await expect(secondUserOnPage2).toHaveCount(1);
  }

  async whiteboardAccess() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.changeWhiteboardAccess);
    await this.modPage.waitForSelector(e.multiWhiteboardTool);
    const resp = await this.modPage.page.evaluate((multiWhiteboardTool) => {
      return document.querySelector(multiWhiteboardTool).children[0].innerText === '1';
    }, e.multiWhiteboardTool);
    await expect(resp).toBeTruthy();
  }
}

exports.MultiUsers = MultiUsers;
