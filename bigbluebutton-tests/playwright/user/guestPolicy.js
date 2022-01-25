const { MultiUsers } = require("./multiusers");
const e = require('../core/elements');
const { sleep } = require('../core/helpers');

class GuestPolicy extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async askModerator() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.guestPolicyLabel);
    await this.modPage.waitAndClick(e.askModerator);
    await this.initUserPage(false);
    await this.modPage.hasElement(e.waitingUsersBtn);
  }

  async alwaysAccept() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.guestPolicyLabel);
    await this.modPage.waitAndClick(e.alwaysAccept);
    await this.initUserPage(false);
    await this.userPage.hasElement(e.audioModal);
  }

  async alwaysDeny() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.guestPolicyLabel);
    await this.modPage.waitAndClick(e.alwaysDeny);
    await sleep(1500);
    await this.initUserPage(false);
    await this.userPage.hasElement(e.joinMeetingDemoPage);
  }
}

exports.GuestPolicy = GuestPolicy;
