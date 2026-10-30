import { expect, Page as PlaywrightPage, test } from '@playwright/test';

import { field, queryDocument, runMutation, runQuery, typedVarMutation } from '../core/apolloProbe';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import {
  CLASS_CREATE_PARAMETER,
  ensureProbe,
  expectRoomMode,
  expectRoomModeStable,
  expectRoomSettingsStable,
  readRoomSettings,
  RoomSettings,
} from './roomMode';
import { CLASS_APPLIED, MEETING_APPLIED, readWhiteboardWriteAccess, setMuted } from './roomModeApply';
import { hasPanel, RoomModePanel, startsRoom } from './roomModePanel';
import { NO_PRE_FLIGHT_INIT_OPTIONS, NO_ROOM_MODE_PANEL_INIT_OPTIONS, ROOM_MODE_PANEL_INIT_OPTIONS } from './util';

const LOCK_SETTINGS_QUERY = queryDocument([
  field('meeting', [
    field('lockSettings', [
      field('disableCam'),
      field('disableMic'),
      field('disablePrivateChat'),
      field('disablePublicChat'),
      field('disableNotes'),
      field('hideUserList'),
      field('lockOnJoin'),
      field('lockOnJoinConfigurable'),
      field('hideViewersCursor'),
      field('hideViewersAnnotation'),
      field('presenterPolicy'),
    ]),
  ]),
]);

interface LockSettingsRow {
  disableCam: boolean;
  disableMic: boolean;
  disablePrivateChat: boolean;
  disablePublicChat: boolean;
  disableNotes: boolean;
  hideUserList: boolean;
  lockOnJoin: boolean;
  lockOnJoinConfigurable: boolean;
  hideViewersCursor: boolean;
  hideViewersAnnotation: boolean;
  presenterPolicy: string;
}

export const readLockSettings = async (page: Page): Promise<LockSettingsRow> => {
  const data = await runQuery(page.page, LOCK_SETTINGS_QUERY);
  const rows = data.meeting as { lockSettings: LockSettingsRow }[];
  if (!rows?.length) throw new Error('meeting returned no rows');
  return rows[0].lockSettings;
};

// A lock no mode defines, set by hand the way the lock viewers modal sends it: every field.
const lockPrivateChat = async (page: Page) => {
  const current = await readLockSettings(page);
  return runMutation(
    page.page,
    typedVarMutation('meetingLockSettingsSetProps', {
      disableCam: { type: 'Boolean!', value: current.disableCam },
      disableMic: { type: 'Boolean!', value: current.disableMic },
      disablePrivChat: { type: 'Boolean!', value: true },
      disablePubChat: { type: 'Boolean!', value: current.disablePublicChat },
      disableNotes: { type: 'Boolean!', value: current.disableNotes },
      hideUserList: { type: 'Boolean!', value: current.hideUserList },
      lockOnJoin: { type: 'Boolean!', value: current.lockOnJoin },
      lockOnJoinConfigurable: { type: 'Boolean!', value: current.lockOnJoinConfigurable },
      hideViewersCursor: { type: 'Boolean!', value: current.hideViewersCursor },
      hideViewersAnnotation: { type: 'Boolean!', value: current.hideViewersAnnotation },
      presenterPolicy: { type: 'String!', value: current.presenterPolicy },
    }),
  );
};

// A guest policy set by hand: no mode asserts one.
const setGuestPolicy = (page: Page, guestPolicy: string) =>
  runMutation(
    page.page,
    typedVarMutation('guestUsersSetPolicy', { guestPolicy: { type: 'String!', value: guestPolicy } }),
  );

export const expectRoomSettings = async (page: Page, expected: RoomSettings, message: string) => {
  await expect(async () => {
    expect(await readRoomSettings(page), message).toEqual(expected);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

export const openRoomModeTab = async (page: Page) => {
  await page.waitAndClick(e.settingsSidebarButton);
  await page.waitAndClick(e.settingsRoomModeTab);
  await page.hasElement(e.settingsRoomModePanel, 'should display the room modes tab');
};

// Picks Meeting in the tab and confirms it from the window's footer.
export const switchToMeeting = async (page: Page) => {
  await openRoomModeTab(page);
  await page.waitAndClick(e.settingsRoomModeMeeting);
  await page.waitAndClick(e.settingsRoomModeChangeButton);
  await page.wasRemoved(e.settingsRoomModePanel, 'should close the settings once the mode is changed');
  await expectRoomMode(page, 'meeting', 'should record the meeting mode once it is changed');
};

export class RoomModeSwitch extends RoomModePanel {
  // A room created away from both presets, started with Class from the pre-flight.
  protected async startsClass(page: PlaywrightPage, options: InitExtraPageOptionsProps) {
    await this.initModPageWithPanel(page, { createParameter: CLASS_CREATE_PARAMETER, ...options });
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    expect(await readRoomSettings(this.modPage), 'should start the room with the class preset').toEqual(CLASS_APPLIED);
  }

  // A viewer who joins through the pre-flight with the room modes setting on.
  private async initViewerWithRoomModes() {
    await this.initUserPage(this.context, ROOM_MODE_PANEL_INIT_OPTIONS);
    await this.userPage.waitAndClick(e.preFlightJoinButton);
    await this.userPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.userPage);
  }

  // The tab in a class room with a viewer in: only moderators get it, nothing is applied
  // until another mode is picked and confirmed, and the switch reaches everyone over the
  // room as created.
  async switchesFromTheTab(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);

    // The tab marks the room's current mode, and only moderators get it.
    await test.step('Only moderators get the room modes tab', async () => {
      await openRoomModeTab(this.modPage);
      await expect(
        this.modPage.page.locator(e.settingsRoomModeClass),
        'should mark the class mode as the current one',
      ).toHaveAttribute('data-current', 'true');
      await expect(
        this.modPage.page.locator(e.settingsRoomModeMeeting),
        'should not mark the meeting mode as the current one',
      ).not.toHaveAttribute('data-current', 'true');

      await this.initViewerWithRoomModes();
      await this.userPage.waitAndClick(e.settingsSidebarButton);
      await this.userPage.hasElement(e.saveSettingsButton, 'should open the settings for the viewer');
      await expect(
        this.userPage.page.locator(e.settingsRoomModeTab),
        'should not offer the room modes tab to a viewer',
      ).toHaveCount(0);
    });

    // Nothing to apply until the pick differs from the room's mode.
    await test.step('Nothing to change until another mode is picked', async () => {
      const change = this.modPage.page.locator(e.settingsRoomModeChangeButton);
      await expect(change, 'should not offer a change before a pick').toBeDisabled();
      await this.modPage.waitAndClick(e.settingsRoomModeClass);
      await expect(change, 'should not offer a change for the current mode').toBeDisabled();
      await this.modPage.waitAndClick(e.settingsRoomModeMeeting);
      await expect(change, 'should offer the change for another mode').toBeEnabled();
      await this.modPage.waitAndClick(e.settingsRoomModeClass);
      await expect(change, 'should not offer a change once back on the current mode').toBeDisabled();
    });

    // Back leaves the summary without keeping its edits; settings fixed for the session show disabled.
    await test.step('Settings fixed for the session show disabled', async () => {
      await this.modPage.waitAndClick(e.settingsRoomModeEditClass);
      await this.modPage.hasElement(e.settingsRoomModeSummary, "should open the class mode's summary");
      await expect(
        this.modPage.page.locator(e.settingsRoomModeFixedBreakoutRooms),
        'should show breakout rooms as fixed for the session',
      ).toBeDisabled();
      await this.modPage.waitAndClick(e.settingsRoomModeBackButton);
      await this.modPage.wasRemoved(e.settingsRoomModeSummary, 'should go back to the modes');
      await this.modPage.hasElement(e.settingsRoomModeMeeting, 'should list the modes again');
    });

    // Saving or closing with a pending pick asks first, and discarding leaves the room as it was.
    await test.step('Closing with a pending pick asks first', async () => {
      await this.modPage.waitAndClick(e.settingsRoomModeMeeting);
      await this.modPage.waitAndClick(e.aboutTabButton);
      await this.modPage.waitAndClick(e.saveSettingsButton);
      await this.modPage.hasElement(e.unsavedChangesCancel, 'should ask before saving over the pick');
      await expect(
        this.modPage.page.getByText('The room mode you picked has not been changed.'),
        'should say only the pick is dropped',
      ).toBeVisible();
      await this.modPage.waitAndClick(e.unsavedChangesCancel);
      await this.modPage.hasElement(e.saveSettingsButton, 'should keep the settings open');
      await this.modPage.page.keyboard.press('Escape');
      await this.modPage.hasElement(e.unsavedChangesIgnore, 'should ask before discarding the pick');
      await this.modPage.waitAndClick(e.unsavedChangesIgnore);
      await this.modPage.wasRemoved(e.settingsRoomModePanel, 'should close the settings');
      await expectRoomModeStable(this.modPage, 'class', 'should keep the class mode');
      expect(await readRoomSettings(this.modPage), 'should keep the class settings').toEqual(CLASS_APPLIED);
    });

    // Switching applies the new mode over the room as it was created: the previous
    // mode and what was changed by hand since are both dropped. A viewer already in
    // the room follows the switch: Meeting takes the whiteboard back.
    await test.step('Switching applies the new mode over the room as created, and a viewer follows it', async () => {
      await expect(async () => {
        expect(await readWhiteboardWriteAccess(this.userPage), 'should let the viewer draw under the class mode').toBe(
          true,
        );
      }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
      expect((await setGuestPolicy(this.modPage, 'ASK_MODERATOR')).errors, 'should accept the guest policy').toEqual(
        [],
      );
      expect((await lockPrivateChat(this.modPage)).errors, 'should accept the private chat lock').toEqual([]);
      await expect(async () => {
        expect((await readRoomSettings(this.modPage)).guestPolicy, 'should show the guest policy changed by hand').toBe(
          'ASK_MODERATOR',
        );
        expect((await readLockSettings(this.modPage)).disablePrivateChat, 'should show the private chat locked').toBe(
          true,
        );
      }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

      await switchToMeeting(this.modPage);
      // The guest policy goes back to the room's own, and the meeting preset over the
      // room as created, not over the class settings.
      await expectRoomSettings(
        this.modPage,
        MEETING_APPLIED,
        'should apply the meeting preset over the room as created',
      );
      expect(
        (await readLockSettings(this.modPage)).disablePrivateChat,
        'should drop the private chat lock set by hand: the room was created without it',
      ).toBe(false);
      await expect(async () => {
        expect(
          await readWhiteboardWriteAccess(this.userPage),
          'should take the whiteboard back from the viewer under the meeting mode',
        ).toBe(false);
      }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
      // The mode is recorded after the whiteboard, so the read waits for it too.
      await expect(async () => {
        expect(await readRoomSettings(this.userPage), 'should show the viewer the meeting settings').toEqual(
          MEETING_APPLIED,
        );
      }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
    });
  }

  async noTabWhenDisabled(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithPanel(page, { ...NO_ROOM_MODE_PANEL_INIT_OPTIONS, ...options });
    await startsRoom(this.modPage);
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.hasElement(e.saveSettingsButton, 'should open the settings');
    await expect(
      this.modPage.page.locator(e.settingsRoomModeTab),
      'should not offer the room modes tab with its setting off',
    ).toHaveCount(0);
  }

  // A pick the pre-flight skipped because another moderator was in is handed to the
  // Room modes tab, pre-selected, and applies from there over the room as created.
  async picksUpSkippedPick(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithPanel(page, { createParameter: CLASS_CREATE_PARAMETER, ...options });
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await this.initModPage2(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);

    await startsRoom(this.modPage);
    await this.modPage.waitAndClick(e.roomModeHandoffButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.settingsRoomModePanel, 'should open the room modes tab');
    await ensureProbe(this.modPage);
    // The handoff comes from the applier's skip, which sends nothing.
    await expectRoomMode(this.modPage, '', 'should not apply the pick while another moderator is in');
    await expect(
      this.modPage.page.locator(e.settingsRoomModeClass),
      'should pre-select the pick the pre-flight could not apply',
    ).toHaveAttribute('aria-checked', 'true');
    await this.modPage.waitAndClick(e.settingsRoomModeChangeButton);
    await expectRoomMode(this.modPage, 'class', 'should record the class mode from the tab');
    await expectRoomSettings(this.modPage, CLASS_APPLIED, 'should apply the class preset over the room as created');
  }

  // A control edited in the mode's summary wins over the preset.
  async editedControlWins(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await openRoomModeTab(this.modPage);
    const change = this.modPage.page.locator(e.settingsRoomModeChangeButton);
    await this.modPage.waitAndClick(e.settingsRoomModeMeeting);
    await expect(change, 'should offer the change once another mode is picked').toBeEnabled();
    await this.modPage.waitAndClick(e.settingsRoomModeEditMeeting);
    await this.modPage.hasElement(e.settingsRoomModeSummary, "should open the meeting mode's summary");
    const applyChanges = this.modPage.page.locator(e.settingsRoomModeApplyChangesButton);
    await expect(applyChanges, 'should not keep anything before an edit').toBeDisabled();
    await this.modPage.page.locator(e.settingsRoomModeWhiteboard).check();
    await expect(change, 'should not change the mode while the edits are not kept').toBeDisabled();
    await this.modPage.waitAndClick(e.settingsRoomModeApplyChangesButton);
    await this.modPage.wasRemoved(e.settingsRoomModeSummary, 'should go back to the modes once the edits are kept');
    await this.modPage.waitAndClick(e.settingsRoomModeChangeButton);
    await expectRoomMode(this.modPage, 'meeting', 'should record the meeting mode once it is changed');
    await expectRoomSettings(
      this.modPage,
      { ...MEETING_APPLIED, multiUserWhiteboardEnabled: true },
      'should apply the whiteboard as edited instead of the meeting preset',
    );
  }

  // A reload after the switch applies nothing again.
  async reloadChangesNothing(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await switchToMeeting(this.modPage);
    await expectRoomSettings(this.modPage, MEETING_APPLIED, 'should apply the meeting preset');
    expect((await setMuted(this.modPage, false)).errors, 'should accept the change made by hand').toEqual([]);
    await expectRoomSettings(this.modPage, { ...MEETING_APPLIED, muteOnStart: false }, 'should show the hand change');

    await this.modPage.page.reload();
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage);
    await expectRoomSettingsStable(
      this.modPage,
      { ...MEETING_APPLIED, muteOnStart: false },
      'should keep the hand change after a reload, without applying the mode again',
    );
  }

  // A second moderator arriving after the switch applies nothing.
  async secondModeratorDoesNotReapply(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await switchToMeeting(this.modPage);
    expect((await setMuted(this.modPage, false)).errors, 'should accept the change made by hand').toEqual([]);
    await expectRoomSettings(this.modPage, { ...MEETING_APPLIED, muteOnStart: false }, 'should show the hand change');

    await this.initModPage2(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await expectRoomSettingsStable(
      this.modPage,
      { ...MEETING_APPLIED, muteOnStart: false },
      'should keep the hand change once a second moderator joins',
    );
  }
}
