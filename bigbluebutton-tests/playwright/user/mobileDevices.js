const { MultiUsers } = require("./multiusers");
const e = require('../core/elements');

class MobileDevices extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async mobileTagName() {
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.waitForSelector(e.currentUser);
    await this.modPage.hasElement(e.mobileUser);
  }

  async whiteboardNotAppearOnMobile() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListButton);
    await this.userPage.waitAndClick(e.userListButton);
    await this.userPage.waitAndClick(e.chatButtonKey);
    await this.modPage.wasRemoved(e.whiteboard);
    await this.userPage.wasRemoved(e.whiteboard);
  }

  async userlistNotAppearOnMobile() {
    await this.modPage.wasRemoved(e.userListItem);
    await this.userPage.wasRemoved(e.userListItem);
  }

  async chatPanelNotAppearOnMobile() {
    await this.modPage.wasRemoved(e.chatButtonKey);
    await this.userPage.waitAndClick(e.userListButton);
    await this.userPage.waitAndClick(e.chatButtonKey);
    await this.userPage.hasElement(e.chatButtonKey);
  }
}

exports.MobileDevices = MobileDevices;
