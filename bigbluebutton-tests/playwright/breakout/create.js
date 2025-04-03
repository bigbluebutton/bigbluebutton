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
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 }); // needed for better create breakout rooms button disposition
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    // assign user to first room
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    if (captureNotes) await this.modPage.page.check(e.captureBreakoutSharedNotes);
    if (captureWhiteboard) await this.modPage.page.check(e.captureBreakoutWhiteboard);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.modalConfirmButton, 'should appear the modal confirm button to join breakout');
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.userPage.hasElement(e.breakoutRoomSidebarButton, 'should display the breakout room sidebar button for the attendee after rooms are created');
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }

  async createToAllowChooseOwnRoom() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.allowChoiceRoom);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.modalConfirmButton);
  }

  async changeNumberOfRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.getLocator(e.selectNumberOfRooms).selectOption('7');
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElementCount(e.breakoutRoomItemOnManage, 7, 'should have 7 breakout rooms created');
  }

  async changeDurationTime() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.randomlyAssign);
    const createButtonLocator = this.modPage.getLocator(e.createBreakoutRoomsButton);
    //test minimum 5 minutes
    await this.modPage.getLocator(e.durationTime).press('Backspace');
    await this.modPage.getLocator(e.durationTime).press('Backspace');
    await this.modPage.type(e.durationTime, '5');
    await expect(createButtonLocator, 'should have the create button for the breakout rooms enabled.').toBeEnabled();

    await this.modPage.page.fill(e.durationTime, '4');
    await expect(createButtonLocator, 'should have the breakout room create button disabled.').toBeDisabled();
    await this.modPage.hasElement(e.minimumDurationWarnBreakout, 'should have at least 5 minutes of breakout room duration time.');

    // await this.modPage.getLocator(e.durationTime).press('Backspace');
    await this.modPage.page.fill(e.durationTime, '15');
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasText(e.breakoutRemainingTime, /14:[0-5][0-9]/, 'should have the breakout room remaining time between 14:00 and 14:59 minutes', ELEMENT_WAIT_LONGER_TIME);
  }

  async changeRoomsName() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.randomlyAssign);
    //Change room's name
    await this.modPage.type(e.roomNameInput, 'Test');
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasText(e.roomName1Test, /Test/, 'should display the correct breakout room name');
  }

  async removeAndResetAssignments() {
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 }); // needed for better create breakout rooms button disposition
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    // Reset assignments
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/, 'should have an attendee on second breakout room box');
    await this.modPage.waitAndClick(e.resetAssignments);
    await this.modPage.hasText(e.breakoutBox0, /Attendee/, 'should have and attendee on first breakout room box');

    // Remove specific assignment
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(`${e.breakoutBox1} span[role="button"]`);
    await this.modPage.hasText(e.breakoutBox0, /Attendee/, 'should display the attendee name on the first breakout room box');
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }

  async dragDropUserInRoom() {
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 }); // needed for better create breakout rooms button disposition
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    // check no user assigned
    const createButtonLocator = this.modPage.getLocator(e.createBreakoutRoomsButton);
    await expect(createButtonLocator, 'should designate a user to a specific a breakout room, before creating it').toBeDisabled();
    await this.modPage.hasElement(e.warningNoUserAssigned, 'should designate a user to a specific a breakout room, before creating it');

    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/, 'should have the attendee on the second breakout room');
    await expect(createButtonLocator).toBeEnabled();
    await this.modPage.wasRemoved(e.warningNoUserAssigned, 'should designate a user to a specific a breakout room, before creating it');
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.hasText(e.userNameBreakoutRoom, /Attendee/, 'should have the attendee name on the first breakout room', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }
}

exports.Create = Create;
