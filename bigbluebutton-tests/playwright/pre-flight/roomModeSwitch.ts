import { expect, Page as PlaywrightPage } from '@playwright/test';

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
import { CLASS_APPLIED, MEETING_APPLIED, readWhiteboardWriteAccess, routeOperation, setMuted } from './roomModeApply';
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

// The tab gives up a change ROOM_MODE_APPLY_TIMEOUT (15 s) after the click; the constant
// scales with the suite's timeout multiplier.
const CHANGE_GIVEN_UP_TIME = ELEMENT_WAIT_EXTRA_LONG_TIME * 2;

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

  // The tab marks the room's current mode, and only moderators get it.
  async showsTabToModeratorsOnly(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
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

  // Switching applies the new mode's settings and leaves what no mode sets, such as
  // the guest policy or a lock changed by hand, as the room has it.
  async switchKeepsWhatNoModeSets(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    expect((await setGuestPolicy(this.modPage, 'ASK_MODERATOR')).errors, 'should accept the guest policy').toEqual([]);
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
    await expectRoomSettings(
      this.modPage,
      { ...MEETING_APPLIED, guestPolicy: 'ASK_MODERATOR' },
      'should apply the meeting preset and keep the guest policy changed by hand',
    );
    expect(
      (await readLockSettings(this.modPage)).disablePrivateChat,
      'should keep the private chat lock set by hand: no mode sets it',
    ).toBe(true);
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

  // Back leaves the summary without keeping its edits; settings fixed for the session show disabled.
  async showsFixedSettingsDisabled(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await openRoomModeTab(this.modPage);
    await this.modPage.waitAndClick(e.settingsRoomModeEditClass);
    await this.modPage.hasElement(e.settingsRoomModeSummary, "should open the class mode's summary");
    await expect(
      this.modPage.page.locator(e.settingsRoomModeFixedBreakoutRooms),
      'should show breakout rooms as fixed for the session',
    ).toBeDisabled();
    await this.modPage.waitAndClick(e.settingsRoomModeBackButton);
    await this.modPage.wasRemoved(e.settingsRoomModeSummary, 'should go back to the modes');
    await this.modPage.hasElement(e.settingsRoomModeMeeting, 'should list the modes again');
  }

  // Nothing to apply until the pick differs from the room's mode.
  async changeNeedsADifferentMode(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await openRoomModeTab(this.modPage);
    const change = this.modPage.page.locator(e.settingsRoomModeChangeButton);
    await expect(change, 'should not offer a change before a pick').toBeDisabled();
    await this.modPage.waitAndClick(e.settingsRoomModeClass);
    await expect(change, 'should not offer a change for the current mode').toBeDisabled();
    await this.modPage.waitAndClick(e.settingsRoomModeMeeting);
    await expect(change, 'should offer the change for another mode').toBeEnabled();
    await this.modPage.waitAndClick(e.settingsRoomModeClass);
    await expect(change, 'should not offer a change once back on the current mode').toBeDisabled();
  }

  // Saving or closing with a pending pick asks first, and discarding leaves the room as it was.
  async asksBeforeDiscardingAPick(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await openRoomModeTab(this.modPage);
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
  }

  // A change that never lands gives the focus back to the window once given up, so Esc
  // reaches the window without a click in it first.
  async escapeReachesWindowAfterFailedChange(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    // Set before the join, as a route only reaches sockets opened after it; the pre-flight's
    // own room mode request goes through.
    let dropping = false;
    const dropped: string[] = [];
    await routeOperation(page, 'SetRoomMode', ({ id, server, message }) => {
      if (!dropping) {
        server.send(message);
        return;
      }
      dropped.push(id);
    });
    await this.startsClass(page, options);
    await openRoomModeTab(this.modPage);
    await this.modPage.waitAndClick(e.settingsRoomModeMeeting);
    dropping = true;
    await this.modPage.waitAndClick(e.settingsRoomModeChangeButton);
    await expect
      .poll(() => dropped.length, {
        message: 'should drop the room mode request',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
    await expect(
      this.modPage.page.locator(e.settingsRoomModeChangeButton),
      'should give the change up once ROOM_MODE_APPLY_TIMEOUT passes',
    ).toBeEnabled({ timeout: CHANGE_GIVEN_UP_TIME });

    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.hasElement(e.unsavedChangesIgnore, 'should reach the window with Esc after the failed change');
    await this.modPage.waitAndClick(e.unsavedChangesIgnore);
    await this.modPage.wasRemoved(e.settingsRoomModePanel, 'should close the settings');
    await expectRoomMode(this.modPage, 'class', 'should keep the class mode');
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

  // A pick the pre-flight skipped because another moderator was in is handed to the
  // Room modes tab, pre-selected, and applies from there.
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
    await expectRoomModeStable(this.modPage, '', 'should not apply the pick while another moderator is in');
    await expect(
      this.modPage.page.locator(e.settingsRoomModeClass),
      'should pre-select the pick the pre-flight could not apply',
    ).toHaveAttribute('aria-checked', 'true');
    await this.modPage.waitAndClick(e.settingsRoomModeChangeButton);
    await expectRoomMode(this.modPage, 'class', 'should record the class mode from the tab');
    await expectRoomSettings(this.modPage, CLASS_APPLIED, 'should apply the class preset from the tab');
  }

  // A viewer already in the room follows the switch: Meeting takes the whiteboard back.
  async viewerFollowsTheSwitch(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsClass(page, options);
    await this.initViewerWithRoomModes();
    await expect(async () => {
      expect(await readWhiteboardWriteAccess(this.userPage), 'should let the viewer draw under the class mode').toBe(
        true,
      );
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await switchToMeeting(this.modPage);
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
  }
}
