const { MultiUsers } = require("./multiusers");
const e = require('../core/elements');

class MobileDevices extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async mobileTagName() {
    await this.modPage.waitAndClick(e.toggleSidebarNavigation);
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitForSelector(e.currentUser);
    await this.modPage.hasText(e.userNameSubs, 'Mobile', 'should display the mobile text as user sub for the moderator');
  }
}

exports.MobileDevices = MobileDevices;
