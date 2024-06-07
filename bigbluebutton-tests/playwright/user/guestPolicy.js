const { MultiUsers } = require("./multiusers");
const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { setGuestPolicyOption } = require("./util");
const { ELEMENT_WAIT_LONGER_TIME } = require("../core/constants");

class GuestPolicy extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async messageToGuestLobby() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.hasElement(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.type(e.waitingUsersLobbyMessage, 'test');
    await this.modPage.waitAndClick(e.sendLobbyMessage);
    await this.modPage.hasText(e.lobbyMessage, /test/);
  }

  async allowEveryone() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(e.guestMessage, /wait/);
    await this.userPage.hasText(e.positionInWaitingQueue, /first/);
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.allowEveryone);
    
    await this.userPage.hasText(e.guestMessage, /approved/, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.viewerAvatar, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.audioModal);

  }

  async denyEveryone() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.denyEveryone);
    
    await this.userPage.hasText(e.guestMessage, /denied/, ELEMENT_WAIT_LONGER_TIME);
  }

  async rememberChoice() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.rememberCheckboxId);
    await this.modPage.hasElementEnabled(e.rememberCheckboxId);
    await this.modPage.waitAndClick(e.denyEveryone);

    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.deniedMessageElement);
  }

  async messageToSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.privateMessageGuest);
    await this.modPage.type(e.inputPrivateLobbyMesssage, 'test');
    await this.modPage.waitAndClick(e.sendPrivateLobbyMessage);
    await this.userPage.hasText(e.guestMessage, /test/, ELEMENT_WAIT_LONGER_TIME);
  }

  async acceptSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(e.guestMessage, /wait/);
    await this.userPage.hasText(e.positionInWaitingQueue, /first/);
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.acceptGuest);
    await this.userPage.hasText(e.guestMessage, /approved/, ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.waitForSelector(e.viewerAvatar, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.audioModal);
  }

  async denySpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.denyGuest);
    await this.userPage.hasText(e.guestMessage, /denied/, ELEMENT_WAIT_LONGER_TIME);
  }

  async alwaysAccept() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await this.modPage.hasElement(e.waitingUsersBtn);
    await setGuestPolicyOption(this.modPage, e.alwaysAccept);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.audioModal);
  }

  async alwaysDeny() {
    await setGuestPolicyOption(this.modPage, e.alwaysDeny);
    await sleep(1500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.deniedMessageElement);
  }
}

exports.GuestPolicy = GuestPolicy;
