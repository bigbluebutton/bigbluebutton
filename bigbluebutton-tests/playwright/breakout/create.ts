import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

export class Create extends MultiUsers {
  // Create BreakoutRooms
  async create(captureNotes = false, captureWhiteboard = false) {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    // assign user to first room
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);

    if (captureNotes) await this.modPage.page.check(e.captureBreakoutSharedNotes);
    if (captureWhiteboard) await this.modPage.page.check(e.captureBreakoutWhiteboard);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(e.modalConfirmButton, 'should appear the modal confirm button to join breakout');
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout room item');
  }

  async createToAllowChooseOwnRoom() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    await this.modPage.waitAndClick(e.allowChoiceRoom);

    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should display the modal confirm button to join breakout after creating rooms allowing to choose own room',
    );
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should display the breakout room item element');
  }

  async changeNumberOfRooms() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.page.locator(e.selectNumberOfRooms).selectOption('7');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasElementCount(e.breakoutRoomItemOnManage, 7, 'should have 7 breakout rooms created');
  }

  async changeDurationTime() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);

    const createButtonLocator = this.modPage.page.locator(e.modalConfirmButton);

    // test minimum 5 minutes
    await this.modPage.page.locator(e.durationTime).press('Backspace');
    await this.modPage.page.locator(e.durationTime).press('Backspace');
    await this.modPage.type(e.durationTime, '5');
    await expect(createButtonLocator, 'should have the create button for the breakout rooms enabled.').toBeEnabled();

    await this.modPage.page.fill(e.durationTime, '4');
    await expect(createButtonLocator, 'should have the breakout room create button disabled.').toBeDisabled();
    await this.modPage.hasElement(
      e.minimumDurationWarnBreakout,
      'should have at least 5 minutes of breakout room duration time.',
    );

    // await this.modPage.page.locator(e.durationTime).press('Backspace');
    await this.modPage.page.fill(e.durationTime, '15');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(
      e.breakoutRemainingTime,
      /14:[0-5][0-9]/,
      'should have the breakout room remaining time between 14:00 and 14:59 minutes',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async changeRoomsName() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);
    // Change room's name
    await this.modPage.type(e.roomNameInput, 'Test');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.roomName1Test, /Test/, 'should display the correct breakout room name');
  }

  async removeAndResetAssignments() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    // Reset assignments
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/, 'should have an attendee on second breakout room box');
    await this.modPage.waitAndClick(e.resetAssignments);
    await this.modPage.hasText(e.breakoutBox0, /Attendee/, 'should have and attendee on first breakout room box');

    // Remove specific assignment
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(`${e.breakoutBox1} span[role="button"]`);
    await this.modPage.hasText(e.breakoutBox0, /Attendee/, 'should have and attendee on first breakout room box');
  }

  async dragDropUserInRoom() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    // testing no user assigned
    const modalConfirmButton = this.modPage.page.locator(e.modalConfirmButton);
    await expect(
      modalConfirmButton,
      'should designate a user to a specific a breakout room, before creating it',
    ).toBeDisabled();
    await this.modPage.hasElement(
      e.warningNoUserAssigned,
      'should designate a user to a specific a breakout room, before creating it',
    );

    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/, 'should have the attendee on the second breakout room');
    await expect(modalConfirmButton).toBeEnabled();
    await this.modPage.wasRemoved(
      e.warningNoUserAssigned,
      'should designate a user to a specific a breakout room, before creating it',
    );
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(
      e.userNameBreakoutRoom,
      /Attendee/,
      'should have the attendee name on the first breakout room',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }
}
