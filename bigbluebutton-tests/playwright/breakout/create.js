const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { expect } = require('@playwright/test');

class Create extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  // Create BreakoutRooms
  async create(captureNotes = false, captureWhiteboard = false) {
    await this.modPage.waitAndClick(e.manageUsers, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    // assign user to first room
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);

    if (captureNotes) await this.modPage.page.check(e.captureBreakoutSharedNotes);
    if (captureWhiteboard) await this.modPage.page.check(e.captureBreakoutWhiteboard);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem);
  }

  async createToAllowChooseOwnRoom() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    await this.modPage.waitAndClick(e.allowChoiceRoom);

    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(e.modalConfirmButton);
    await this.modPage.hasElement(e.breakoutRoomsItem);
  }

  async changeNumberOfRooms() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.getLocator(e.selectNumberOfRooms).selectOption('7');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.checkElementCount(e.userNameBreakoutRoom7, 1);
  }

  async changeDurationTime() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);

    const createButtonLocator = this.modPage.getLocator(e.modalConfirmButton);

    //test minimum 5 minutes
    await this.modPage.getLocator(e.durationTime).press('Backspace');
    await this.modPage.getLocator(e.durationTime).press('Backspace');
    await this.modPage.type(e.durationTime, '5');
    await expect(createButtonLocator).toBeEnabled();

    await this.modPage.page.fill(e.durationTime, '4');
    await expect(createButtonLocator).toBeDisabled();
    await this.modPage.hasElement(e.minimumDurationWarnBreakout);

    // await this.modPage.getLocator(e.durationTime).press('Backspace');
    await this.modPage.page.fill(e.durationTime, '15');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.breakoutRemainingTime, /14:[0-5][0-9]/, ELEMENT_WAIT_LONGER_TIME);
  }

  async changeRoomsName() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);
    //Change room's name
    await this.modPage.type(e.roomNameInput, 'Test');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.roomName1Test, /Test/);
  }

  async removeAndResetAssignments() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    // Reset assignments
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/);
    await this.modPage.waitAndClick(e.resetAssignments);
    await this.modPage.hasText(e.breakoutBox0, /Attendee/);

    // Remove specific assignment
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(`${e.breakoutBox1} span[role="button"]`);
    await this.modPage.hasText(e.breakoutBox0, /Attendee/);
  }

  async dragDropUserInRoom() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    //testing no user assigned
    const modalConfirmButton = this.modPage.getLocator(e.modalConfirmButton);
    await expect(modalConfirmButton, 'Getting error when trying to create a breakout room without designating any user.').toBeDisabled();
    await this.modPage.hasElement(e.warningNoUserAssigned);

    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/);
    await expect(modalConfirmButton).toBeEnabled();
    await this.modPage.wasRemoved(e.warningNoUserAssigned);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.userNameBreakoutRoom, /Attendee/, ELEMENT_WAIT_LONGER_TIME);
  }
}

exports.Create = Create;
