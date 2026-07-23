import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
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

    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should appear the "modal confirm button" to join breakout rooms',
    );
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the "breakout rooms item" on moderator page');
    await this.userPage.hasElement(e.breakoutRoomsItem, 'should have the "breakout rooms item" on attendee page');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.wasRemoved(
      e.createBreakoutRooms,
      'should not have the "create breakout rooms" option after creating breakout rooms',
    );
    await this.modPage.hasElement(
      e.inviteUsersToBreakoutRooms,
      'should have the "invite to breakout rooms" option when breakout rooms are created',
    );
    await this.modPage.press('Escape'); // close manage users dropdown
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
    await this.modPage.fill(e.roomNameInput1, 'TestRoom 1');
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.roomName1Test, /TestRoom 1/, 'should display the correct breakout room name');
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

  async inheritLockSettingsCheckboxIsVisible() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    await this.modPage.hasElement(
      e.inheritLockSettingsCheckbox,
      'should display the "Propagate the current lock settings" checkbox in the create breakout modal',
    );
    const checkbox = this.modPage.page.locator(e.inheritLockSettingsCheckbox);
    await expect(checkbox, 'checkbox should be unchecked by default').not.toBeChecked();
    await this.modPage.press('Escape');
  }

  async lockViewersVisibleInBreakoutGearMenu() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    // Mod is not assigned — button is "Ask to join"; click it to request a URL
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    // Wait for URL to be generated (button changes to "Join Room 1")
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: 5000 });
      await breakoutTab.click(e.closeModal);
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'should display the Lock Viewers option in the gear menu inside a breakout room',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.close();
  }

  async modCanDisableInheritedLockInBreakout() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Enable webcam lock in main room
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    // The checkbox is visually hidden (ScreenreaderInput); click its parent Switch container
    await this.modPage.page.locator(e.lockShareWebcam).locator('xpath=..').click();
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Create breakout with inherited lock settings
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.page.check(e.inheritLockSettingsCheckbox);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: 5000 });
      await breakoutTab.click(e.closeModal);
    } catch { /* audio modal not present */ }

    // Wait for the React app to be ready in the breakout tab
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout and verify webcam is locked (inherited)
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'should display Lock Viewers in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam lock should be enabled in breakout room (inherited from main room)',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Mod disables webcam lock and enables webcamsOnlyForModerator — force-click the hidden ScreenreaderInputs
    await breakoutTab.locator(e.lockShareWebcam).click({ force: true });
    await breakoutTab.locator(e.lockSeeOtherViewersWebcam).click({ force: true });

    // Verify toggles flipped within the same modal (native input.checked, not subscription-driven)
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam lock toggle should be unchecked after click',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'webcamsOnlyForModerator toggle should be checked after click',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Apply — mod must NOT be ejected by either the lockSettings or webcamsOnlyForModerator mutation
    await breakoutTab.locator(e.applyLockSettings).click();

    await expect(
      breakoutTab.locator(e.manageUsers),
      'moderator should still be in the breakout room (not ejected by the server after changing lock settings)',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
  }

  async modCanApplyLockSettingsInBreakout() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Create breakout without inheriting lock settings (default: all locks off)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: 5000 });
      await breakoutTab.click(e.closeModal);
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'should display Lock Viewers in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();

    // Enable webcam lock and webcamsOnlyForModerator (both start unchecked)
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam lock should be off by default (no inheritance)',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockShareWebcam).click({ force: true });
    await breakoutTab.locator(e.lockSeeOtherViewersWebcam).click({ force: true });

    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam lock toggle should be checked after click',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'webcamsOnlyForModerator toggle should be checked after click',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Apply — mod must NOT be ejected by either mutation
    await breakoutTab.locator(e.applyLockSettings).click();

    await expect(
      breakoutTab.locator(e.manageUsers),
      'moderator should still be in the breakout room after applying lock settings without inheritance',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
  }

  async modCanApplyLockSettingsInBreakoutWithInheritance() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Enable mic lock in main room (different from webcam to distinguish from modCanDisableInheritedLockInBreakout)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.page.locator(e.lockShareMicrophone).locator('xpath=..').click();
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Create breakout with inherited lock settings
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.page.check(e.inheritLockSettingsCheckbox);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: 5000 });
      await breakoutTab.click(e.closeModal);
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout and verify mic lock was inherited
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'should display Lock Viewers in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();
    await expect(
      breakoutTab.locator(e.lockShareMicrophone),
      'mic lock should be enabled in breakout room (inherited from main room)',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Disable mic lock and enable webcamsOnlyForModerator
    await breakoutTab.locator(e.lockShareMicrophone).click({ force: true });
    await breakoutTab.locator(e.lockSeeOtherViewersWebcam).click({ force: true });

    await expect(
      breakoutTab.locator(e.lockShareMicrophone),
      'mic lock toggle should be unchecked after click',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'webcamsOnlyForModerator toggle should be checked after click',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Apply — mod must NOT be ejected by either mutation
    await breakoutTab.locator(e.applyLockSettings).click();

    await expect(
      breakoutTab.locator(e.manageUsers),
      'moderator should still be in the breakout room after changing inherited lock settings',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
  }

  async lockSettingsNotPropagatedByDefault() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Enable private chat lock in main room
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.page.locator(e.lockPrivateChat).locator('xpath=..').click();
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Create breakout WITHOUT the "Propagate" checkbox (default: unchecked)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: 5000 });
      await breakoutTab.click(e.closeModal);
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout and verify NO lock settings were propagated
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'Lock Viewers should be visible in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();

    await expect(
      breakoutTab.locator(e.lockPrivateChat),
      'private chat lock should NOT be enforced in breakout when propagation is off',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam lock should NOT be enforced in breakout when propagation is off',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockShareMicrophone),
      'microphone lock should NOT be enforced in breakout when propagation is off',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
  }

  async lockSettingsPropagatedWhenChecked() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Enable private chat lock and webcam lock in main room
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.page.locator(e.lockPrivateChat).locator('xpath=..').click();
    await this.modPage.page.locator(e.lockShareWebcam).locator('xpath=..').click();
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Create breakout WITH the "Propagate" checkbox checked
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.page.check(e.inheritLockSettingsCheckbox);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: 5000 });
      await breakoutTab.click(e.closeModal);
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout and verify lock settings WERE propagated
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'Lock Viewers should be visible in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();

    await expect(
      breakoutTab.locator(e.lockPrivateChat),
      'private chat lock should be enforced in breakout when propagation is on',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam lock should be enforced in breakout when propagation is on',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
  }

  async webcamsOnlyForModeratorPropagatedWhenChecked() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Enable "See other viewers webcams" (webcamsOnlyForModerator) lock in main room
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.page.locator(e.lockSeeOtherViewersWebcam).locator('xpath=..').click();
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Create breakout WITH the "Propagate the current lock settings" checkbox checked
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.page.check(e.inheritLockSettingsCheckbox);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    // The audio modal pops up a few seconds after the breakout tab loads and its
    // overlay intercepts clicks; wait for it, close it, and wait for it to detach.
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: ELEMENT_WAIT_LONGER_TIME });
      await breakoutTab.click(e.closeModal);
      await breakoutTab.locator(e.audioModal).waitFor({ state: 'detached', timeout: ELEMENT_WAIT_LONGER_TIME });
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout and verify webcamsOnlyForModerator WAS propagated from parent
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'Lock Viewers should be visible in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();

    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other viewers webcams (webcamsOnlyForModerator) should be enforced in breakout when propagation is on',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
  }

  async webcamsOnlyForModeratorNotPropagatedByDefault() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // Enable "See other viewers webcams" (webcamsOnlyForModerator) lock in main room
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.page.locator(e.lockSeeOtherViewersWebcam).locator('xpath=..').click();
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Create breakout WITHOUT the "Propagate the current lock settings" checkbox (default: unchecked)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem, 'should have the breakout rooms item');

    // Mod joins breakout room
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.joinRoom1, ELEMENT_WAIT_EXTRA_LONG_TIME);

    const newTabPromise = this.modPage.page.context().waitForEvent('page');
    await this.modPage.waitAndClick(e.joinRoom1);
    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    // The audio modal pops up a few seconds after the breakout tab loads and its
    // overlay intercepts clicks; wait for it, close it, and wait for it to detach.
    try {
      await breakoutTab.waitForSelector(e.audioModal, { timeout: ELEMENT_WAIT_LONGER_TIME });
      await breakoutTab.click(e.closeModal);
      await breakoutTab.locator(e.audioModal).waitFor({ state: 'detached', timeout: ELEMENT_WAIT_LONGER_TIME });
    } catch { /* audio modal not present */ }
    await breakoutTab.locator(e.manageUsers).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // Open Lock Viewers in breakout and verify webcamsOnlyForModerator was NOT propagated
    await breakoutTab.locator(e.manageUsers).click();
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'Lock Viewers should be visible in breakout gear menu',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.locator(e.lockViewersButton).click();

    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other viewers webcams (webcamsOnlyForModerator) should NOT be enforced in breakout when propagation is off',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
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
