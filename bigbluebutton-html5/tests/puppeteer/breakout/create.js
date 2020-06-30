const Page = require('../core/page');
const params = require('../params');
const util = require('./util');
const be = require('./elements');

class Create {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'Moderator1' }, undefined);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' }, undefined);
  }

  // Create Breakoutrooms
  async create(testName) {
    await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await this.page1.page.evaluate(util.clickTestElement, be.manageUsers);
    await this.page1.page.evaluate(util.clickTestElement, be.createBreakoutRooms);
    await this.page1.screenshot(`${testName}`, `02-page01-creating-breakoutrooms-${testName}`);
    await this.page1.waitForSelector(be.randomlyAssign);
    await this.page1.page.evaluate(util.clickTestElement, be.randomlyAssign);
    await this.page1.screenshot(`${testName}`, `03-page01-randomly-assign-user-${testName}`);
    await this.page1.waitForSelector(be.modalConfirmButton);
    await this.page1.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    await this.page1.screenshot(`${testName}`, `04-page01-confirm-breakoutrooms-creation-${testName}`);
    await this.page2.waitForSelector(be.modalConfirmButton);
    await this.page2.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    await this.page2.screenshot(`${testName}`, `02-page02-accept-invite-breakoutrooms-${testName}`);
  }

  // Check if Breakoutrooms have been created
  async testCreated(testName) {
    const resp = await this.page1.page.evaluate(() => document.querySelectorAll('div[data-test="breakoutRoomsItem"]').length !== 0);
    if (resp === true) {
      await this.page1.screenshot(`${testName}`, `05-page01-success-${testName}`);
      return true;
    }
    await this.page1.screenshot(`${testName}`, `05-page01-fail-${testName}`);
    return false;
  }

  // Initialize a Moderator session
  async joinWithUser3() {
    await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = Create;
