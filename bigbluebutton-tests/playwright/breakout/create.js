const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Create {
  constructor(browser, context) {
    this.browser = browser;
    this.context = context;
  }

  // Join BigBlueButton meeting with a Moderator and a Viewer
  async init(page1) {
    this.modPage1 = new Page(this.browser, page1);
    await this.modPage1.init(true, true, { fullName: 'Moderator1' });
    await this.initViewer();
  }

  // Join BigBlueButton meeting with a Viewer only
  async initViewer() {
    const page2 = await this.context.newPage();
    this.userPage1 = new Page(this.browser, page2);
    await this.userPage1.init(false, true, { fullName: 'Viewer1', meetingId: this.modPage1.meetingId });
  }

  // Create Breakoutrooms
  async create() {
    await this.modPage1.waitAndClick(e.manageUsers);
    await this.modPage1.waitAndClick(e.createBreakoutRooms);

    await this.modPage1.waitAndClick(e.randomlyAssign);
    await this.modPage1.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    
    await this.userPage1.hasElement(e.modalConfirmButton);
    await this.userPage1.waitAndClick(e.closeModal);
    await this.modPage1.hasElement(e.breakoutRoomsItem);
  }
}

module.exports = exports = Create;