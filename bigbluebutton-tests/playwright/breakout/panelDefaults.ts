import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { readRows } from '../core/graphql';
import { applyClientSettingsOverridesToContext, ClientSettingsOverrides, Page } from '../core/page';
import { Create } from './create';

const BREAKOUT_POLICIES = 'subscription { meeting { breakoutPolicies { record captureSlides captureNotes } } }';

interface BreakoutPolicies {
  record: boolean;
  captureSlides: boolean;
  captureNotes: boolean;
}

export type RecordOption = 'absent' | 'unticked' | 'ticked';

export class PanelDefaults extends Create {
  private async readBreakoutPolicies(): Promise<BreakoutPolicies | undefined> {
    const [meeting] = await readRows<{ breakoutPolicies: BreakoutPolicies }>(
      this.modPage,
      BREAKOUT_POLICIES,
      'meeting',
    );
    return meeting?.breakoutPolicies;
  }

  private async openCreatePanel() {
    // the panel needs a wide viewport to show the start button and the room cards side by side
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.hasElement(
      e.createBreakoutRoomsButton,
      'should open the breakout room creation panel',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  private async expandMoreOptions() {
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    await expect(
      this.modPage.page.locator(e.moreOptionsToggle),
      'should expand the more options section of the creation panel',
    ).toHaveAttribute('aria-expanded', 'true');
    // always offered, so the options list has rendered when it shows
    await this.modPage.hasElement(e.allowChoiceRoom, 'should list the "Allow users to choose a room" option');
  }

  private async expectSwitch(selector: string, checked: boolean, description: string) {
    const option = this.modPage.page.locator(selector);
    await expect(option, `should offer the option: ${description}`).toBeVisible();
    await expect(option, `should ${checked ? '' : 'not '}pre-tick the option: ${description}`).toBeChecked({
      checked,
    });
  }

  private async assignToFirstRoom(name: string) {
    await this.modPage.page
      .locator(e.unassignedUser, { hasText: name })
      .dragTo(this.modPage.page.locator(e.breakoutBox1), { timeout: ELEMENT_WAIT_TIME });
    await this.modPage.hasText(e.breakoutBox1, name, `should list ${name} in the first room`);
  }

  async allowChooseRoomPreTicked(checked: boolean) {
    await this.openCreatePanel();
    await this.expandMoreOptions();
    await this.expectSwitch(e.allowChoiceRoom, checked, 'Allow users to choose a room');
  }

  async captureSwitchesPreTicked({ whiteboard, sharedNotes }: { whiteboard: boolean; sharedNotes: boolean }) {
    await this.openCreatePanel();
    await this.expandMoreOptions();
    await this.expectSwitch(e.captureBreakoutWhiteboard, whiteboard, 'Capture whiteboard');
    await this.expectSwitch(e.captureBreakoutSharedNotes, sharedNotes, 'Capture shared notes');
  }

  async captureSwitchesFollowTheCreateParameters() {
    const policies = await this.readBreakoutPolicies();
    expect(
      policies?.captureSlides,
      'the meeting should carry breakoutRoomsCaptureSlides=true from the create call',
    ).toBe(true);
    expect(policies?.captureNotes, 'the meeting should carry breakoutRoomsCaptureNotes=true from the create call').toBe(
      true,
    );
    await this.captureSwitchesPreTicked({ whiteboard: true, sharedNotes: true });
  }

  async recordOption(expected: RecordOption, breakoutRoomsRecord: boolean) {
    const policies = await this.readBreakoutPolicies();
    expect(policies?.record, `the meeting should carry breakoutRoomsRecord=${breakoutRoomsRecord}`).toBe(
      breakoutRoomsRecord,
    );
    await this.openCreatePanel();
    await this.expandMoreOptions();
    if (expected === 'absent') {
      await expect(
        this.modPage.page.locator(e.recordBreakoutRooms),
        'should not offer the Record option in the creation panel',
      ).toHaveCount(0);
    } else {
      await this.expectSwitch(e.recordBreakoutRooms, expected === 'ticked', 'Record');
    }
  }

  async inviteModeratorsPreTicked(checked: boolean) {
    await this.openCreatePanel();
    await this.expandMoreOptions();
    await this.expectSwitch(e.sendInvitationToModeratorsCheckbox, checked, 'Send invitation to assigned moderators');
  }

  async assignedModeratorInvitation(sendInvitation: boolean) {
    if (!this?.modPage2) throw new Error('modPage2 not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.openCreatePanel();
    await this.modPage.hasElement(e.attendeeNotAssigned, 'should list the users not assigned to a room yet');
    await this.assignToFirstRoom(this.modPage2.username);
    await this.assignToFirstRoom(this.userPage.username);
    await this.expandMoreOptions();
    await PanelDefaults.setCheckboxChecked(this.modPage.page, e.sendInvitationToModeratorsCheckbox, sendInvitation);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should invite the assigned attendee to join the room',
      ELEMENT_WAIT_LONGER_TIME,
    );
    if (sendInvitation) {
      await this.modPage2.hasElement(
        e.modalConfirmButton,
        'should invite the assigned moderator to join the room when the invitation option is ticked',
        ELEMENT_WAIT_LONGER_TIME,
      );
    } else {
      // the second moderator has received the rooms, so an invitation would be showing by now
      await this.modPage2.waitAndClick(e.breakoutRoomSidebarButton);
      await this.modPage2.hasElement(
        e.roomOptions1,
        'should list the running rooms for the second moderator',
        ELEMENT_WAIT_LONGER_TIME,
      );
      await this.modPage2.wasRemoved(
        e.modalConfirmButton,
        'should not invite the assigned moderator to join the room when the invitation option is unticked',
      );
    }
    await this.modPage.setHeightWidthViewPortSize();
  }

  async numberOfRoomsStaysWithin(minimum: number, limit: number) {
    const rooms = this.modPage.page.locator(e.breakoutRoomBoxes);
    const decrease = this.modPage.page.locator(e.decreaseRooms);
    const increase = this.modPage.page.locator(e.increaseRooms);

    await this.openCreatePanel();
    await expect(rooms, `should start with the minimum of ${minimum} rooms`).toHaveCount(minimum);
    await expect(decrease, `should not allow fewer than ${minimum} rooms`).toBeDisabled();

    for (let count = minimum; count < limit; count += 1) {
      await expect(increase, `should allow more than ${count} rooms`).toBeEnabled();
      await increase.click();
      await expect(rooms, `should show ${count + 1} rooms after increasing`).toHaveCount(count + 1);
    }
    await expect(increase, `should not allow more than ${limit} rooms`).toBeDisabled();
    await expect(rooms, `should stop at the limit of ${limit} rooms`).toHaveCount(limit);

    await expect(decrease, `should allow fewer rooms above the minimum of ${minimum}`).toBeEnabled();
    await decrease.click();
    await expect(rooms, `should show ${limit - 1} rooms after decreasing`).toHaveCount(limit - 1);
  }

  async presentationManagementInRoom(allowedInRooms: boolean, overrides?: ClientSettingsOverrides) {
    if (!this?.userPage) throw new Error('userPage not initialized');

    // control: the setting does not apply outside a breakout room
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.hasElement(e.managePresentations, 'should offer the parent presenter to manage presentations');
    await this.modPage.press('Escape');
    await this.modPage.wasRemoved(e.managePresentations, 'should close the media sharing menu');

    await this.openCreatePanel();
    await this.modPage.hasElement(e.attendeeNotAssigned, 'should list the users not assigned to a room yet');
    await this.assignToFirstRoom(this.userPage.username);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitAndClick(e.modalDismissButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.roomOptions1, 'should display the first breakout room options button');

    if (overrides) await applyClientSettingsOverridesToContext(this.modPage.page.context(), overrides);
    const room = new Page(this.browser, await this.joinFirstBreakoutRoomAsModerator(), this.modPage.testInfo);
    expect(
      await room.page.evaluate(
        () =>
          (window as unknown as { meetingClientSettings: { public: { app: { breakouts: Record<string, unknown> } } } })
            .meetingClientSettings.public.app.breakouts.allowPresentationManagementInBreakouts,
      ),
      `the breakout room should run with allowPresentationManagementInBreakouts=${allowedInRooms}`,
    ).toBe(allowedInRooms);

    await room.waitAndClick(e.mediaAreaButton, ELEMENT_WAIT_LONGER_TIME);
    // control: the moderator is the room's presenter and the menu is open
    await expect(
      room.page.locator(e.startScreenSharing),
      'should offer the room presenter to share the screen',
    ).toBeEnabled({ timeout: ELEMENT_WAIT_LONGER_TIME });
    if (allowedInRooms) {
      await room.hasElement(e.managePresentations, 'should offer the room presenter to manage presentations');
    } else {
      await room.wasRemoved(e.managePresentations, 'should not offer the room presenter to manage presentations');
    }

    await room.page.close();
    await this.modPage.setHeightWidthViewPortSize();
  }
}
