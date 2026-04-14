import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

export class Create extends MultiUsers {
  // Create BreakoutRooms
  async create(captureNotes = false, captureWhiteboard = false) {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // needed for better create breakout rooms button disposition
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);

    // assign user to first room
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    if (captureNotes) await this.modPage.page.check(e.captureBreakoutSharedNotes);
    if (captureWhiteboard) await this.modPage.page.check(e.captureBreakoutWhiteboard);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.modalConfirmButton, 'should appear the modal confirm button to join breakout');
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.userPage.hasElement(
      e.breakoutRoomSidebarButton,
      'should display the breakout room sidebar button for the attendee after rooms are created',
    );
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }

  async createToAllowChooseOwnRoom() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    await this.modPage.waitAndClick(e.allowChoiceRoom);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should display the modal confirm button to join breakout after creating rooms allowing to choose own room',
    );
  }

  async changeNumberOfRooms() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.randomlyAssign);
    // Increase rooms to have 7 in total (default is 2)
    for (let i = 0; i < 5; i += 1) {
      await this.modPage.waitAndClick(e.increaseRooms);
    }
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElementCount(e.breakoutRoomItemOnManage, 7, 'should have 7 breakout rooms created');
  }

  async changeDurationTime() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.randomlyAssign);

    const createButtonLocator = this.modPage.page.locator(e.createBreakoutRoomsButton);

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
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.hasValue(
      e.breakoutRoomTimerMinutesInput,
      '14',
      'should have the breakout room remaining time between 14:00 and 14:59 minutes',
    );
  }

  async changeRoomsName() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.randomlyAssign);
    // Change room's name
    await this.modPage.waitAndClick(e.roomName1);
    await this.modPage.fill(e.roomNameInput1, 'TestRoom 1');
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasText(e.roomName1Test, /TestRoom 1/, 'should display the correct breakout room name');
  }

  async removeAndResetAssignments() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    // needed for better create breakout rooms button disposition
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);

    // Remove specific assignment
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(`${e.breakoutBox1} button`);
    await this.modPage.hasText(
      e.breakoutBox0,
      /Attendee/,
      'should display the attendee name on the first breakout room box',
    );
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }

  async dragDropUserInRoom() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // needed for better create breakout rooms button disposition
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    // testing no user assigned
    const createButtonLocator = this.modPage.page.locator(e.createBreakoutRoomsButton);
    await expect(
      createButtonLocator,
      'should designate a user to a specific a breakout room, before creating it',
    ).toBeDisabled();

    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/, 'should have the attendee on the second breakout room');
    await expect(createButtonLocator).toBeEnabled();
    await this.modPage.wasRemoved(
      e.warningNoUserAssigned,
      'should designate a user to a specific a breakout room, before creating it',
    );
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.hasText(
      e.userNameBreakoutRoom,
      /Attendee/,
      'should have the attendee name on the first breakout room',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }
}
