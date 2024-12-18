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

  async whiteboardNotAppearOnMobile() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListButton);
    await this.userPage.waitAndClick(e.userListButton);
    await this.userPage.waitAndClick(e.chatButtonKey);
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendeee');
  }

  async userListNotAppearOnMobile() {
    await this.modPage.wasRemoved(e.userListItem, 'should not display the user list for the moderator');
    await this.userPage.wasRemoved(e.userListItem, 'should not display the user list for the attendee');
  }

  async chatPanelNotAppearOnMobile() {
    await this.modPage.wasRemoved(e.chatButtonKey, 'should not display the chat button key for the moderator');
    await this.userPage.waitAndClick(e.userListButton);
    await this.userPage.waitAndClick(e.chatButtonKey);
    await this.userPage.hasElement(e.chatButtonKey, 'should display the chat button key for the attendee');
  }
}

exports.MobileDevices = MobileDevices;
