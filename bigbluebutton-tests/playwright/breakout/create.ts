import { expect, Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

export class Create extends MultiUsers {
  private static async closeAudioModalIfPresent(page: PlaywrightPage) {
    try {
      await page.locator(e.audioModal).waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME });
      await page.locator(e.closeModal).click();
      await page.locator(e.audioModal).waitFor({ state: 'detached', timeout: ELEMENT_WAIT_LONGER_TIME });
    } catch {
      /* audio modal not present */
    }
  }

  private static async setCheckboxChecked(page: PlaywrightPage, selector: string, checked: boolean) {
    const checkbox = page.locator(selector);
    await checkbox.waitFor({ state: 'attached', timeout: ELEMENT_WAIT_LONGER_TIME });
    if ((await checkbox.isChecked()) !== checked) await checkbox.click({ force: true });

    if (checked) {
      await expect(checkbox).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    } else {
      await expect(checkbox).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    }
  }

  private static async setPermissionAllowed(page: PlaywrightPage, selector: string, allowed: boolean) {
    await Create.setCheckboxChecked(page, selector, allowed);
  }

  private static async getLockViewersButton(page: PlaywrightPage) {
    const lockViewersButton = page.locator(e.lockViewersButton);
    const isLockViewersButtonVisible = await lockViewersButton
      .isVisible({ timeout: ELEMENT_WAIT_LONGER_TIME })
      .catch(() => false);

    if (!isLockViewersButtonVisible) {
      await page.locator(e.usersListSidebarButton).click({ timeout: ELEMENT_WAIT_LONGER_TIME });
    }

    await expect(lockViewersButton).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    return lockViewersButton;
  }

  private static async openLockViewersPermissions(page: PlaywrightPage) {
    const lockViewersButton = await Create.getLockViewersButton(page);
    await lockViewersButton.click({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await page.locator(e.participantPermissionsTab).click({ timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  private async applyMainRoomDeniedPermissions(permissionSelectors: string[]) {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await Create.openLockViewersPermissions(this.modPage.page);
    for (const selector of permissionSelectors) {
      await Create.setPermissionAllowed(this.modPage.page, selector, false);
    }
    await this.modPage.waitAndClick(e.applyLockSettings);
  }

  private async createAssignedBreakout(inheritLockSettings = false) {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.attendeeNotAssigned, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);

    if (inheritLockSettings) {
      await this.modPage.waitAndClick(e.moreOptionsToggle);
      await Create.setCheckboxChecked(this.modPage.page, e.inheritLockSettingsCheckbox, true);
    }

    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.roomOptions1, 'should display the first breakout room options button');
  }

  private async joinFirstBreakoutRoomAsModerator() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    const isRoomOptionsVisible = await this.modPage.page
      .locator(e.roomOptions1)
      .isVisible({ timeout: ELEMENT_WAIT_LONGER_TIME })
      .catch(() => false);

    if (!isRoomOptionsVisible) await this.modPage.waitAndClick(e.breakoutRoomsItem);

    const newTabPromise = this.modPage.page.context().waitForEvent('page', {
      timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
    });
    await this.modPage.waitAndClick(e.roomOptions1, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.askJoinRoom1, ELEMENT_WAIT_LONGER_TIME);

    const breakoutTab = await newTabPromise;
    await breakoutTab.waitForLoadState('domcontentloaded');
    await Create.closeAudioModalIfPresent(breakoutTab);
    await breakoutTab.locator(e.presentationTitle).waitFor({
      state: 'visible',
      timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
    });

    return breakoutTab;
  }

  // Create BreakoutRooms
  async create(captureNotes = false, captureWhiteboard = false) {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // needed for better create breakout rooms button disposition
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.page.waitForTimeout(2000); // wait for the breakout sidebar to be fully loaded.

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

  async inheritLockSettingsCheckboxIsVisible() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsToggle);

    await this.modPage.hasElement(
      e.inheritLockSettingsCheckbox,
      'should display the "Propagate the current lock settings" checkbox in the create breakout panel',
    );
    const checkbox = this.modPage.page.locator(e.inheritLockSettingsCheckbox);
    await expect(checkbox, 'checkbox should be unchecked by default').not.toBeChecked();
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
  }

  async lockViewersVisibleInBreakoutGearMenu() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.createAssignedBreakout();
    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.getLockViewersButton(breakoutTab);
    await expect(
      breakoutTab.locator(e.lockViewersButton),
      'should display the Lock Viewers option in the participants panel inside a breakout room',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async modCanDisableInheritedLockInBreakout() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.applyMainRoomDeniedPermissions([e.lockShareWebcam]);
    await this.createAssignedBreakout(true);

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam sharing permission should be disabled in breakout room (inherited from main room)',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await Create.setPermissionAllowed(breakoutTab, e.lockShareWebcam, true);
    await Create.setPermissionAllowed(breakoutTab, e.lockSeeOtherViewersWebcam, false);

    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam sharing permission should be enabled after click',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other participants webcam permission should be disabled after click',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.locator(e.applyLockSettings).click();

    await expect(
      breakoutTab.locator(e.presentationTitle),
      'moderator should still be in the breakout room (not ejected by the server after changing lock settings)',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async modCanApplyLockSettingsInBreakout() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.createAssignedBreakout();

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam sharing permission should be enabled by default (no inheritance)',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await Create.setPermissionAllowed(breakoutTab, e.lockShareWebcam, false);
    await Create.setPermissionAllowed(breakoutTab, e.lockSeeOtherViewersWebcam, false);

    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam sharing permission should be disabled after click',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other participants webcam permission should be disabled after click',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.locator(e.applyLockSettings).click();

    await expect(
      breakoutTab.locator(e.presentationTitle),
      'moderator should still be in the breakout room after applying lock settings without inheritance',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async modCanApplyLockSettingsInBreakoutWithInheritance() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.applyMainRoomDeniedPermissions([e.lockShareMicrophone]);
    await this.createAssignedBreakout(true);

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);
    await expect(
      breakoutTab.locator(e.lockShareMicrophone),
      'microphone sharing permission should be disabled in breakout room (inherited from main room)',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await Create.setPermissionAllowed(breakoutTab, e.lockShareMicrophone, true);
    await Create.setPermissionAllowed(breakoutTab, e.lockSeeOtherViewersWebcam, false);

    await expect(
      breakoutTab.locator(e.lockShareMicrophone),
      'microphone sharing permission should be enabled after click',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other participants webcam permission should be disabled after click',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.locator(e.applyLockSettings).click();

    await expect(
      breakoutTab.locator(e.presentationTitle),
      'moderator should still be in the breakout room after changing inherited lock settings',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async lockSettingsNotPropagatedByDefault() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.applyMainRoomDeniedPermissions([e.lockPrivateChat]);
    await this.createAssignedBreakout();

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);

    await expect(
      breakoutTab.locator(e.lockPrivateChat),
      'private chat permission should remain enabled in breakout when propagation is off',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam sharing permission should remain enabled in breakout when propagation is off',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockShareMicrophone),
      'microphone sharing permission should remain enabled in breakout when propagation is off',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async lockSettingsPropagatedWhenChecked() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.applyMainRoomDeniedPermissions([e.lockPrivateChat, e.lockShareWebcam]);
    await this.createAssignedBreakout(true);

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);

    await expect(
      breakoutTab.locator(e.lockPrivateChat),
      'private chat permission should be disabled in breakout when propagation is on',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      breakoutTab.locator(e.lockShareWebcam),
      'webcam sharing permission should be disabled in breakout when propagation is on',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async webcamsOnlyForModeratorPropagatedWhenChecked() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.applyMainRoomDeniedPermissions([e.lockSeeOtherViewersWebcam]);
    await this.createAssignedBreakout(true);

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);

    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other participants webcam permission should be disabled in breakout when propagation is on',
    ).not.toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
  }

  async webcamsOnlyForModeratorNotPropagatedByDefault() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.applyMainRoomDeniedPermissions([e.lockSeeOtherViewersWebcam]);
    await this.createAssignedBreakout();

    const breakoutTab = await this.joinFirstBreakoutRoomAsModerator();
    await Create.openLockViewersPermissions(breakoutTab);

    await expect(
      breakoutTab.locator(e.lockSeeOtherViewersWebcam),
      'see other participants webcam permission should remain enabled in breakout when propagation is off',
    ).toBeChecked({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await breakoutTab.close();
    await this.modPage.setHeightWidthViewPortSize();
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
