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
    await this.modPage.hasElement(e.waitingUsersBtn, 'should display the waiting users button');

    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.type(e.waitingUsersLobbyMessage, 'test');
    await this.modPage.waitAndClick(e.sendLobbyMessage);
    await this.modPage.hasText(e.lobbyMessage, /test/, 'should the lobby message contain the text "test"');
  }

  async allowEveryone() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(e.guestMessage, /wait/, 'should the guest message contain the text "wait" for the attendee');
    await this.userPage.hasText(e.positionInWaitingQueue, /first/, 'should the position in waiting queue contain the text "first" for the attendee');
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.allowEveryone);
    
    await this.userPage.hasText(e.guestMessage, /approved/, 'should the guest message contain the text "approved" for the attendee', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.viewerAvatar, 'should display the viewer avatar for the moderator', ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.audioModal, 'should display the audio modal for the attendee');

  }

  async denyEveryone() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.denyEveryone);
    
    await this.userPage.hasText(e.guestMessage, /denied/, 'should the guest message contain the text "denied" for the attendee',ELEMENT_WAIT_LONGER_TIME);
  }

  async rememberChoice() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.rememberCheckboxId);
    await this.modPage.hasElementEnabled(e.rememberCheckboxId, 'should display the remember checkbox id as enabled');
    await this.modPage.waitAndClick(e.denyEveryone);

    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.deniedMessageElement, 'should display the denied message for the attendee');
  }

  async messageToSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.privateMessageGuest);
    await this.modPage.type(e.inputPrivateLobbyMesssage, 'test');
    await this.modPage.waitAndClick(e.sendPrivateLobbyMessage);
    await this.userPage.hasText(e.guestMessage, /test/, 'should the guest message contain the text "test" for the attendee', ELEMENT_WAIT_LONGER_TIME);
  }

  async acceptSpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasText(e.guestMessage, /wait/, 'should the guest message contain the text "wait" for the attendee');
    await this.userPage.hasText(e.positionInWaitingQueue, /first/, 'should the position in waiting queue contain the text "first"');
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.acceptGuest);
    await this.userPage.hasText(e.guestMessage, /approved/, 'should the guest message contain the text "approved" for the attendee', ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.waitForSelector(e.viewerAvatar, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.audioModal, 'should display the audio modal for the attendee');
  }

  async denySpecificUser() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.modPage.waitAndClick(e.waitingUsersBtn);

    await this.modPage.waitAndClick(e.denyGuest);
    await this.userPage.hasText(e.guestMessage, /denied/, 'should the guest message contain the text "denied" for the attendee', ELEMENT_WAIT_LONGER_TIME);
  }

  async alwaysAccept() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    await setGuestPolicyOption(this.modPage, e.alwaysAccept);
    await sleep(500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.audioModal, 'should display the audio modal for the attendee');
  }

  async alwaysDeny() {
    await setGuestPolicyOption(this.modPage, e.alwaysDeny);
    await sleep(1500);
    await this.initUserPage(false, this.context, { shouldCheckAllInitialSteps: false });
    await this.userPage.hasElement(e.deniedMessageElement, 'should display the denied message for the attendee');
  }
}

exports.GuestPolicy = GuestPolicy;
