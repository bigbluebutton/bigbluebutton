import { expect, Page as PlaywrightPage, WebSocketRoute } from '@playwright/test';

import { field, queryDocument, runMutation, runQuery, stringVarMutation, typedVarMutation } from '../core/apolloProbe';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import { ensureProbe, expectRoomMode, expectRoomModeStable } from './roomMode';
import { hasPanel, RoomModePanel, startsRoom } from './roomModePanel';
import { NO_PRE_FLIGHT_INIT_OPTIONS, PRE_FLIGHT_CREATE_PARAMETER } from './util';

// Each room is created away from the preset it is applied with, so a value that
// matches the preset can only have come from the applier.
const CLASS_CREATE_PARAMETER = [
  PRE_FLIGHT_CREATE_PARAMETER,
  'lockSettingsDisablePublicChat=true',
  'lockSettingsLockOnJoin=false',
  'lockSettingsPresenterPolicy=freeForAll',
  'webcamsOnlyForModerator=true',
  'record=true',
].join('&');

const MEETING_CREATE_PARAMETER = [
  PRE_FLIGHT_CREATE_PARAMETER,
  'lockSettingsDisablePublicChat=true',
  'lockSettingsLockOnJoin=false',
  'lockSettingsPresenterPolicy=requireApproval',
  'multiUserWhiteboardEnabled=true',
].join('&');

const MODE_CARDS = {
  class: e.preFlightRoomModeClass,
  meeting: e.preFlightRoomModeMeeting,
};

type RoomModeName = keyof typeof MODE_CARDS;

// The room's settings as the server holds them, read through the probe after the join.
export interface RoomSettings {
  roomMode: string;
  disablePublicChat: boolean;
  presenterPolicy: string;
  lockOnJoin: boolean;
  webcamsOnlyForModerator: boolean;
  multiUserWhiteboardEnabled: boolean;
  muteOnStart: boolean;
  isRecording: boolean;
}

const CLASS_APPLIED: RoomSettings = {
  roomMode: 'class',
  disablePublicChat: false,
  presenterPolicy: 'requireApproval',
  lockOnJoin: true,
  webcamsOnlyForModerator: false,
  multiUserWhiteboardEnabled: true,
  muteOnStart: true,
  isRecording: false,
};

const MEETING_APPLIED: RoomSettings = {
  ...CLASS_APPLIED,
  roomMode: 'meeting',
  presenterPolicy: 'freeForAll',
  multiUserWhiteboardEnabled: false,
};

const ROOM_SETTINGS_QUERY = queryDocument([
  field('meeting', [
    field('roomMode'),
    field('lockSettings', [field('disablePublicChat'), field('presenterPolicy'), field('lockOnJoin')]),
    field('usersPolicies', [field('webcamsOnlyForModerator'), field('multiUserWhiteboardEnabled')]),
    field('voiceSettings', [field('muteOnStart')]),
    field('recording', [field('isRecording')]),
  ]),
]);

interface RoomSettingsRow {
  roomMode: string;
  lockSettings: { disablePublicChat: boolean; presenterPolicy: string; lockOnJoin: boolean };
  usersPolicies: { webcamsOnlyForModerator: boolean; multiUserWhiteboardEnabled: boolean };
  voiceSettings: { muteOnStart: boolean };
  recording: { isRecording: boolean } | null;
}

export const readRoomSettings = async (page: Page): Promise<RoomSettings> => {
  const data = await runQuery(page.page, ROOM_SETTINGS_QUERY);
  const rows = data.meeting as RoomSettingsRow[];
  if (!rows?.length) throw new Error('meeting returned no rows');
  const [{ roomMode, lockSettings, usersPolicies, voiceSettings, recording }] = rows;
  return {
    roomMode,
    disablePublicChat: lockSettings.disablePublicChat,
    presenterPolicy: lockSettings.presenterPolicy,
    lockOnJoin: lockSettings.lockOnJoin,
    webcamsOnlyForModerator: usersPolicies.webcamsOnlyForModerator,
    multiUserWhiteboardEnabled: usersPolicies.multiUserWhiteboardEnabled,
    muteOnStart: voiceSettings.muteOnStart,
    isRecording: recording?.isRecording ?? false,
  };
};

// Before the join is confirmed the server refuses the lock settings: such a read is skipped.
const sampleRoomSettings = (page: Page) => readRoomSettings(page).catch(() => undefined);

const OWN_WHITEBOARD_QUERY = queryDocument([field('user_current', [field('whiteboardWriteAccess')])]);

export const readWhiteboardWriteAccess = async (page: Page): Promise<boolean> => {
  const data = await runQuery(page.page, OWN_WHITEBOARD_QUERY);
  const rows = data.user_current as { whiteboardWriteAccess: boolean }[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return rows[0].whiteboardWriteAccess;
};

// A change made by hand, the way the moderator's crowd actions make it.
const setMuted = (page: Page, muted: boolean) =>
  runMutation(
    page.page,
    typedVarMutation('meetingSetMuted', {
      muted: { type: 'Boolean!', value: muted },
      exceptPresenter: { type: 'Boolean!', value: false },
    }),
  );

// A room mode set by a moderator who is not the one under test.
const setRoomMode = (page: Page, roomMode: string) =>
  runMutation(page.page, stringVarMutation('meetingSetRoomMode', { roomMode }));

interface RoutedOperation {
  id: string;
  client: WebSocketRoute;
  server: WebSocketRoute;
  message: string | Buffer;
}

// Every graphql socket of the page goes through here: a message of `operationName` is
// handed to `intercept` instead of the server, the rest is forwarded as is.
const routeOperation = async (
  page: PlaywrightPage,
  operationName: string,
  intercept: (operation: RoutedOperation) => void,
) => {
  await page.routeWebSocket('**/graphql**', (client) => {
    const server = client.connectToServer();
    client.onMessage((message) => {
      if (!message.toString().includes(`"operationName":"${operationName}"`)) {
        server.send(message);
        return;
      }
      const { id } = JSON.parse(message.toString()) as { id: string };
      intercept({ id, client, server, message });
    });
    server.onMessage((message) => client.send(message));
  });
};

// The room opens anyway once ROOM_MODE_APPLY_TIMEOUT (15 s) passes after the join:
// the held request is released well before that.
const ROOM_MODE_HOLD_TIME = 3000;

export class RoomModeApply extends RoomModePanel {
  // The moderator's pre-flight on a room created with `createParameter`, with a mode picked.
  private async picksMode(
    page: PlaywrightPage,
    mode: RoomModeName,
    createParameter: string,
    options: InitExtraPageOptionsProps,
  ) {
    await this.initModPageWithPanel(page, { createParameter, ...options });
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(MODE_CARDS[mode]);
  }

  async appliesClassPreset(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    // The room opens only once the mode is recorded, so this read is settled.
    expect(await readRoomSettings(this.modPage), 'should apply the class preset once the room starts').toEqual(
      CLASS_APPLIED,
    );
  }

  async appliesMeetingPreset(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'meeting', MEETING_CREATE_PARAMETER, options);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    expect(await readRoomSettings(this.modPage), 'should apply the meeting preset once the room starts').toEqual(
      MEETING_APPLIED,
    );
  }

  async viewerJoiningLaterSeesAppliedSettings(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);

    await this.initJoinedViewer();
    expect(
      await readRoomSettings(this.userPage),
      'should show a viewer who joins later the settings the class preset applied',
    ).toEqual(CLASS_APPLIED);
    await expect(async () => {
      expect(
        await readWhiteboardWriteAccess(this.userPage),
        'should let a viewer who joins later write on the whiteboard',
      ).toBe(true);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  // The switch the moderator edited wins over the preset it was set from.
  async editedSwitchWinsOverPreset(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', `${CLASS_CREATE_PARAMETER}&multiUserWhiteboardEnabled=true`, options);
    await this.modPage.hasElement(
      e.preFlightRoomModeWhiteboard,
      'should show the whiteboard switch of the picked mode',
    );
    await this.modPage.page.locator(e.preFlightRoomModeWhiteboard).uncheck();
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    expect(
      await readRoomSettings(this.modPage),
      'should apply the whiteboard switch as edited instead of the class preset',
    ).toEqual({ ...CLASS_APPLIED, multiUserWhiteboardEnabled: false });
  }

  async reloadDoesNotReapply(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    expect(await readRoomSettings(this.modPage), 'should apply the class preset once the room starts').toEqual(
      CLASS_APPLIED,
    );

    expect((await setMuted(this.modPage, false)).errors, 'should accept the change made by hand').toEqual([]);
    await expect(async () => {
      expect((await readRoomSettings(this.modPage)).muteOnStart, 'should show the change made by hand').toBe(false);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await this.modPage.page.reload();
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage);
    // Nothing is expected to apply again, so the read follows a quiet spell long
    // enough for a new application to have landed.
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    expect(
      await readRoomSettings(this.modPage),
      'should keep the change made by hand after a reload, without applying the mode again',
    ).toEqual({ ...CLASS_APPLIED, muteOnStart: false });
  }

  // The room mode is sent last: held back, every setting must already show in the
  // read that shows no mode, and the mode is recorded once released.
  async settingsLandBeforeRoomMode(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    const held: RoutedOperation[] = [];
    await routeOperation(page, 'SetRoomMode', (operation) => {
      held.push(operation);
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await ensureProbe(this.modPage);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    // The probe reads only once the join is confirmed: the held request shows the
    // applier has reached its last step.
    await expect
      .poll(() => held.length, {
        message: 'should hold the room mode request back',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
    await expect(async () => {
      expect(
        await sampleRoomSettings(this.modPage),
        'should apply every class setting while the room mode is still unset',
      ).toEqual({ ...CLASS_APPLIED, roomMode: '' });
    }).toPass({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    held.splice(0).forEach(({ server, message }) => server.send(message));
    await expectRoomMode(this.modPage, 'class', 'should record the class mode once the request is released');
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    expect(await readRoomSettings(this.modPage), 'should keep the class settings once the room opens').toEqual(
      CLASS_APPLIED,
    );
  }

  // The applier's first SetMuted is refused by the server: the room still opens, with no mode.
  async opensRoomWhenApplyFails(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    let refused = 0;
    await routeOperation(page, 'SetMuted', ({ id, client }) => {
      refused += 1;
      client.send(JSON.stringify({ id, type: 'next', payload: { errors: [{ message: 'forced' }] } }));
      client.send(JSON.stringify({ id, type: 'complete' }));
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.wasRemoved(e.preFlight, 'should remove the pre-flight screen when the apply fails');
    await ensureProbe(this.modPage);

    expect(refused, 'should have refused the applier SetMuted').toBeGreaterThan(0);
    await expectRoomModeStable(this.modPage, '', 'should leave the room mode unset when the apply fails');
  }

  // The room mode request is never answered: the room opens with no mode once the
  // apply's deadline passes, after the join.
  async opensRoomWhenApplyHangs(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await routeOperation(page, 'SetRoomMode', () => {
      // Held and never released.
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await this.modPage.waitForSelector(e.layoutContainer, 30000);
    await this.modPage.wasRemoved(e.preFlight, 'should remove the pre-flight screen when the apply times out', 30000);
    await ensureProbe(this.modPage);

    await expectRoomModeStable(this.modPage, '', 'should leave the room mode unset when the apply times out');
  }

  // A step still unanswered when the deadline passes may land later, but nothing
  // after it is sent: the room keeps no mode and the later settings as created.
  async sendsNothingAfterDeadline(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    const held: RoutedOperation[] = [];
    await routeOperation(page, 'SetLockSettings', (operation) => {
      held.push(operation);
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await expect
      .poll(() => held.length, {
        message: 'should hold the lock settings request back',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
    await this.modPage.waitForSelector(e.layoutContainer, 30000);
    await ensureProbe(this.modPage);

    held.splice(0).forEach(({ server, message }) => server.send(message));
    await expectRoomModeStable(this.modPage, '', 'should not record the mode after the deadline');
    expect((await readRoomSettings(this.modPage)).muteOnStart, 'should not send the steps after the deadline').toBe(
      false,
    );
  }

  // The pick goes away with its panel once another moderator sets the mode: joining
  // keeps that mode, and the settings of the pick are not applied over it.
  async keepsModeSetByAnotherModerator(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await this.initModPage2(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage2);

    const result = await setRoomMode(this.modPage2, 'meeting');
    expect(result.errors, 'should accept the room mode from the second moderator').toEqual([]);
    expect(result.data?.meetingSetRoomMode, 'should accept the room mode from the second moderator').toBe(true);
    await this.modPage.wasRemoved(
      e.preFlightRoomModePanel,
      'should remove the room mode panel once the room has a mode',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    await expectRoomModeStable(this.modPage, 'meeting', 'should keep the mode the other moderator set');
    // The room was created with freeForAll and no class lock, so none of the pick's values reached it.
    expect(
      await readRoomSettings(this.modPage),
      'should keep the settings the room was created with, not the pick',
    ).toMatchObject({ presenterPolicy: 'freeForAll', lockOnJoin: false, webcamsOnlyForModerator: true });
  }

  // The pre-flight stays up until the server records the mode, and nothing starts recording.
  async holdsPanelUntilRoomModeRecorded(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    const held: RoutedOperation[] = [];
    await routeOperation(page, 'SetRoomMode', (operation) => {
      held.push(operation);
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await ensureProbe(this.modPage);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await expect
      .poll(() => held.length, {
        message: 'should hold the room mode request back',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);

    await this.modPage.page.waitForTimeout(ROOM_MODE_HOLD_TIME);
    await this.modPage.hasElement(
      e.preFlightRoomModePanel,
      'should keep the room mode panel up until the mode is recorded',
    );
    expect(
      await this.modPage.checkElement(e.layoutContainer),
      'should not open the room before the mode is recorded',
    ).toBeFalsy();

    held.splice(0).forEach(({ server, message }) => server.send(message));
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.wasRemoved(e.preFlight, 'should remove the pre-flight screen once the mode is recorded');
    expect(
      await readRoomSettings(this.modPage),
      'should open the room with the class settings and no recording started',
    ).toEqual(CLASS_APPLIED);
  }
}
