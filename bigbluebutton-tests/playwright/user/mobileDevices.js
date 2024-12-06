const { MultiUsers } = require("./multiusers");
const e = require('../core/elements');

class MobileDevices extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async mobileTagName() {
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.waitForSelector(e.currentUser);
    await this.modPage.hasElement(e.mobileUser, 'should display the mobile user element for the moderator ');
  }
}

exports.MobileDevices = MobileDevices;
