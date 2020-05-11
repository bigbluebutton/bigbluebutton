const Page = require('../core/page');
const params = require('../params');
const util = require('./util');

class Create {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'Moderator1' });
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' });
  }

  async create() {
    await util.waitForBreakoutElements(this.page1);
    await util.createBreakoutRooms(this.page1, this.page2);
  }

  async joinWithUser2() {
    await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator2' });
  }
}

module.exports = exports = Create;
