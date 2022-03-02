const { MultiUsers } = require("./multiusers");
const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { setGuestPolicyOption } = require("./util");

class GuestPolicy extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async askModerator() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false);
    await this.modPage.hasElement(e.waitingUsersBtn);
  }

  async alwaysAccept() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await setGuestPolicyOption(this.modPage, e.alwaysAccept);
    await sleep(500);
    await this.initUserPage(false);
    await this.userPage.hasElement(e.audioModal);
  }

  async alwaysDeny() {
    await setGuestPolicyOption(this.modPage, e.alwaysDeny);
    await sleep(1500);
    await this.initUserPage(false);
    await this.userPage.hasElement(e.joinMeetingDemoPage);
  }
}

exports.GuestPolicy = GuestPolicy;
