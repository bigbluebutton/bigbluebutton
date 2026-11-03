import { expect, Page as PlaywrightPage } from '@playwright/test';

import { field, queryDocument, runQuery } from '../core/apolloProbe';
import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import { ensureProbe } from './roomMode';
import { hasPanel, RoomModePanel, startsRoom } from './roomModePanel';
import { PHONE_VIEWPORT, PRE_FLIGHT_CREATE_PARAMETER } from './util';

type Switch =
  | typeof e.preFlightRoomModeJoinMuted
  | typeof e.preFlightRoomModePublicChat
  | typeof e.preFlightRoomModeWhiteboard;

type Select = typeof e.preFlightRoomModeGuestPolicy | typeof e.preFlightRoomModePresenterPolicy;

interface EditableValues {
  joinMuted: boolean;
  publicChat: boolean;
  presenterPolicy: string;
  whiteboard: boolean;
}

// What each mode sets, as the summary must show it before any edit.
const CLASS_PRESET: EditableValues = {
  joinMuted: true,
  publicChat: true,
  presenterPolicy: 'requireApproval',
  whiteboard: true,
};

const MEETING_PRESET: EditableValues = {
  joinMuted: true,
  publicChat: true,
  presenterPolicy: 'freeForAll',
  whiteboard: false,
};

// The server's own defaults for a room created by the suite (muteOnStart pinned
// off by the pre-flight's create parameter): the preset values must not reach
// the room before it starts.
const AS_CREATED = {
  muteOnStart: false,
  disablePublicChat: false,
  presenterPolicy: 'requireApproval',
  guestPolicy: 'ALWAYS_ACCEPT',
  multiUserWhiteboardEnabled: false,
};

// A room that may record: only there does the summary say a recording never
// starts on its own.
export const RECORDING_ROOM_CREATE_PARAMETER = `${PRE_FLIGHT_CREATE_PARAMETER}&record=true`;

const ROOM_SETTINGS_QUERY = queryDocument([
  field('meeting', [
    field('roomMode'),
    field('lockSettings', [field('disablePublicChat'), field('presenterPolicy')]),
    field('usersPolicies', [field('guestPolicy'), field('multiUserWhiteboardEnabled')]),
    field('voiceSettings', [field('muteOnStart')]),
  ]),
]);

interface RoomSettingsRow {
  roomMode: string;
  lockSettings: { disablePublicChat: boolean; presenterPolicy: string };
  usersPolicies: { guestPolicy: string; multiUserWhiteboardEnabled: boolean };
  voiceSettings: { muteOnStart: boolean };
}

const readRoomSettings = async (page: Page) => {
  const data = await runQuery(page.page, ROOM_SETTINGS_QUERY);
  const rows = data.meeting as RoomSettingsRow[];
  if (!rows?.length) throw new Error('meeting returned no rows');
  const [{ roomMode, lockSettings, usersPolicies, voiceSettings }] = rows;
  return {
    roomMode,
    muteOnStart: voiceSettings.muteOnStart,
    disablePublicChat: lockSettings.disablePublicChat,
    presenterPolicy: lockSettings.presenterPolicy,
    guestPolicy: usersPolicies.guestPolicy,
    multiUserWhiteboardEnabled: usersPolicies.multiUserWhiteboardEnabled,
  };
};

const expectSwitch = async (page: Page, selector: Switch, on: boolean, message: string) => {
  if (on) await expect(page.page.locator(selector), message).toBeChecked();
  else await expect(page.page.locator(selector), message).not.toBeChecked();
};

const expectSelectValue = async (page: Page, selector: Select, value: string, message: string) => {
  await expect(page.page.locator(selector), message).toHaveAttribute('data-value', value);
};

const expectEditables = async (page: Page, values: EditableValues, context: string) => {
  await expectSwitch(page, e.preFlightRoomModeJoinMuted, values.joinMuted, `${context}: join muted`);
  await expectSwitch(page, e.preFlightRoomModePublicChat, values.publicChat, `${context}: public chat`);
  await expectSelectValue(
    page,
    e.preFlightRoomModePresenterPolicy,
    values.presenterPolicy,
    `${context}: who can present`,
  );
  await expectSwitch(page, e.preFlightRoomModeWhiteboard, values.whiteboard, `${context}: whiteboard for everyone`);
};

const pickOption = async (page: Page, selector: Select, value: string) => {
  await page.waitAndClick(selector);
  await page.waitAndClick(`${e.selectMenuItem}[data-value="${value}"]`);
  await expectSelectValue(page, selector, value, `should pick ${value}`);
};

// Edits away from the class preset on every editable item.
const editClassPreset = async (page: Page) => {
  await page.page.locator(e.preFlightRoomModeJoinMuted).uncheck();
  await page.page.locator(e.preFlightRoomModePublicChat).uncheck();
  await pickOption(page, e.preFlightRoomModePresenterPolicy, 'moderatorOnly');
  await page.page.locator(e.preFlightRoomModeWhiteboard).uncheck();
};

// The helper under "Join muted" describes the switch's current state.
const expectJoinMutedHelper = async (page: Page, on: boolean) => {
  await expect(
    page.page.locator(e.preFlightRoomModeJoinMuted),
    'should describe join muted as it currently is',
  ).toHaveAccessibleDescription(on ? 'Joining users are muted by default' : 'Joining users are not muted by default');
};

const CLASS_EDITED: EditableValues = {
  joinMuted: false,
  publicChat: false,
  presenterPolicy: 'moderatorOnly',
  whiteboard: false,
};

export class RoomModeSummary extends RoomModePanel {
  async showsWhatEachModeApplies() {
    await hasPanel(this.modPage);
    expect(
      await this.modPage.checkElement(e.preFlightRoomModeSummary),
      'should not show a settings summary before a mode is picked',
    ).toBeFalsy();

    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await this.modPage.hasElement(e.preFlightRoomModeSummary, 'should show the settings summary of the picked mode');
    await expectEditables(this.modPage, CLASS_PRESET, 'should start from the class preset');
    await expectJoinMutedHelper(this.modPage, true);
    await this.modPage.hasElement(e.preFlightRoomModeAutomaticWebcams, 'should list cameras visible to everyone');
    await this.modPage.hasElement(e.preFlightRoomModeAutomaticLockOnJoin, 'should list locks reaching later arrivals');
    await this.modPage.hasElement(e.preFlightRoomModeAutomaticRecording, 'should say recording never starts by itself');
    await expectSelectValue(
      this.modPage,
      e.preFlightRoomModeGuestPolicy,
      AS_CREATED.guestPolicy,
      "should start the class waiting room from the room's guest policy",
    );

    await this.modPage.waitAndClick(e.preFlightRoomModeMeeting);
    await expectEditables(this.modPage, MEETING_PRESET, 'should start from the meeting preset');
    await expectSelectValue(
      this.modPage,
      e.preFlightRoomModeGuestPolicy,
      AS_CREATED.guestPolicy,
      "should start the meeting waiting room from the room's guest policy",
    );
    await this.modPage.hasElement(
      e.preFlightRoomModeAutomaticWebcams,
      'should list cameras visible to everyone in a meeting',
    );
    await this.modPage.hasElement(
      e.preFlightRoomModeAutomaticLockOnJoin,
      'should list locks reaching later arrivals in a meeting',
    );
    await this.modPage.hasElement(
      e.preFlightRoomModeAutomaticRecording,
      'should say recording never starts by itself in a meeting',
    );
  }

  async keepsEditsWhileModeStaysPicked() {
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await editClassPreset(this.modPage);
    await expectEditables(this.modPage, CLASS_EDITED, 'should show the edits');
    await expectJoinMutedHelper(this.modPage, false);

    // Picking the mode that is already picked is not a mode change.
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await expectEditables(this.modPage, CLASS_EDITED, 'should keep the edits while the mode stays picked');
  }

  async dropsEditsOnModeChangeAndCancel() {
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await editClassPreset(this.modPage);

    await this.modPage.waitAndClick(e.preFlightRoomModeMeeting);
    await expectEditables(this.modPage, MEETING_PRESET, 'should show the meeting preset, not the class edits');
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await expectEditables(this.modPage, CLASS_PRESET, 'should drop the class edits after switching mode and back');

    await editClassPreset(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeCancelButton);
    await this.modPage.wasRemoved(e.preFlightRoomModeSummary, 'should drop the summary on cancel');
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await expectEditables(this.modPage, CLASS_PRESET, 'should drop the edits on cancel');
  }

  // Neither mode asserts the waiting room, so it starts from the room's own
  // policy, read before the join.
  async startsWaitingRoomFromRoom(page: PlaywrightPage, guestPolicy: string, options: InitExtraPageOptionsProps = {}) {
    const createParameter =
      guestPolicy === AS_CREATED.guestPolicy
        ? PRE_FLIGHT_CREATE_PARAMETER
        : `${PRE_FLIGHT_CREATE_PARAMETER}&guestPolicy=${guestPolicy}`;
    await this.initModPageWithPanel(page, { createParameter, ...options });
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await expectSelectValue(
      this.modPage,
      e.preFlightRoomModeGuestPolicy,
      guestPolicy,
      "should start the waiting room from the room's guest policy",
    );
    if (guestPolicy !== 'ALWAYS_ACCEPT_AUTH') {
      await this.modPage.waitAndClick(e.preFlightRoomModeGuestPolicy);
      await this.modPage.hasElement(
        `${e.selectMenuItem}[data-value="ASK_MODERATOR"]`,
        'should open the guest policies',
      );
      await expect(
        this.modPage.page.locator(`${e.selectMenuItem}[data-value="ALWAYS_ACCEPT_AUTH"]`),
        'should not offer a policy the list leaves out in a room without it',
      ).toHaveCount(0);
      await this.modPage.page.keyboard.press('Escape');
    }
  }

  // A policy the list does not offer is shown while it is the room's value,
  // and never offered otherwise.
  async showsRoomOnlyGuestPolicy(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.startsWaitingRoomFromRoom(page, 'ALWAYS_ACCEPT_AUTH', options);
    await pickOption(this.modPage, e.preFlightRoomModeGuestPolicy, 'ASK_MODERATOR');
    await this.modPage.waitAndClick(e.preFlightRoomModeGuestPolicy);
    await this.modPage.hasElement(
      `${e.selectMenuItem}[data-value="ALWAYS_ACCEPT_AUTH"]`,
      "should keep offering the room's own policy after another pick",
    );
    await this.modPage.page.keyboard.press('Escape');
  }

  // A room created to record on its own starts recording as the moderator
  // enters, whatever the mode, and a room that cannot record has nothing to
  // say about it: the summary leaves the line out of both. The second room is
  // not set to record on its own either, so only record decides.
  async leavesRecordingOut(page: PlaywrightPage, record: boolean, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithPanel(page, {
      createParameter: `${PRE_FLIGHT_CREATE_PARAMETER}&record=${record}&autoStartRecording=${record}`,
      ...options,
    });
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await this.modPage.hasElement(e.preFlightRoomModeAutomaticWebcams, 'should still list cameras visible to everyone');
    await this.modPage.hasElement(
      e.preFlightRoomModeAutomaticLockOnJoin,
      'should still list locks reaching later arrivals',
    );
    expect(
      await this.modPage.checkElement(e.preFlightRoomModeAutomaticRecording),
      'should not say recording never starts by itself in this room',
    ).toBeFalsy();
  }

  async appliesNothingYet() {
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await editClassPreset(this.modPage);
    await pickOption(this.modPage, e.preFlightRoomModeGuestPolicy, 'ASK_MODERATOR');
    // Back to on: the class preset asserts it, the room was created without it.
    await this.modPage.page.locator(e.preFlightRoomModeJoinMuted).check();
    await this.modPage.page.locator(e.preFlightRoomModeWhiteboard).check();

    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    // Nothing on this path writes to the room, so a read right after the join is
    // the settled value.
    expect(await readRoomSettings(this.modPage), 'should leave the room as it was created').toEqual({
      roomMode: '',
      ...AS_CREATED,
    });
  }

  async reachesSummaryOnPhone(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.setViewportSize(PHONE_VIEWPORT);
    await this.initModPageWithPanel(page, options);
    await this.modPage.waitAndClick(e.preFlightRoomModeTab);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);

    // A wide control must not push the summary past the screen's edge.
    const box = await this.modPage.page.locator(e.preFlightRoomModeSummary).boundingBox();
    if (!box) throw new Error('the summary has no layout box');
    expect(box.x + box.width, 'should keep the summary within the phone screen').toBeLessThanOrEqual(
      PHONE_VIEWPORT.width,
    );

    const whiteboard = this.modPage.page.locator(e.preFlightRoomModeWhiteboard);
    await whiteboard.scrollIntoViewIfNeeded();
    await whiteboard.uncheck();
    await expectSwitch(this.modPage, e.preFlightRoomModeWhiteboard, false, 'should edit the summary on a phone');
    await expect(
      this.modPage.page.locator(e.preFlightJoinButton),
      'should keep the start button reachable under the summary',
    ).toBeVisible();
  }

  // From the picked card, Tab walks the summary in order: guest policy, join
  // muted, public chat, who can present, whiteboard.
  async operatesSummaryWithKeyboard() {
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await this.modPage.page.locator(e.preFlightRoomModeClass).focus();
    const { keyboard } = this.modPage.page;
    const expectFocused = (selector: string, message: string) =>
      expect(this.modPage.page.locator(selector), message).toBeFocused();

    await keyboard.press('Tab');
    await expectFocused(e.preFlightRoomModeGuestPolicy, 'should reach the guest policy right after the cards');
    await keyboard.press('Tab');
    await expectFocused(e.preFlightRoomModeJoinMuted, 'should reach join muted next');
    await keyboard.press('Space');
    await expectSwitch(this.modPage, e.preFlightRoomModeJoinMuted, false, 'should toggle a switch with the keyboard');
    await keyboard.press('Tab');
    await expectFocused(e.preFlightRoomModePublicChat, 'should reach public chat next');
    await keyboard.press('Tab');
    await expectFocused(e.preFlightRoomModePresenterPolicy, 'should reach who can present next');

    // The menu opens on the current value: one step down is the next policy.
    await keyboard.press('Enter');
    await this.modPage.hasElement(
      `${e.selectMenuItem}[data-value="requireApproval"]`,
      'should open the select with the keyboard',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await keyboard.press('ArrowDown');
    await keyboard.press('Enter');
    await expectSelectValue(
      this.modPage,
      e.preFlightRoomModePresenterPolicy,
      'freeForAll',
      'should pick an option with the arrow keys',
    );

    await expectFocused(e.preFlightRoomModePresenterPolicy, 'should give the focus back to the select');
    await keyboard.press('Tab');
    await expectFocused(e.preFlightRoomModeWhiteboard, 'should reach the whiteboard last');
  }
}
