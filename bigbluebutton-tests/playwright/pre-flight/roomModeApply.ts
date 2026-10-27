import { expect, Page as PlaywrightPage, WebSocketRoute } from '@playwright/test';

import { field, queryDocument, runMutation, runQuery, stringVarMutation, typedVarMutation } from '../core/apolloProbe';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import {
  CLASS_CREATE_PARAMETER,
  CLASS_ROOM_AS_CREATED,
  ensureProbe,
  expectRoomMode,
  expectRoomModeStable,
  readRoomSettings,
  type RoomSettings,
} from './roomMode';
import { hasPanel, pickOption, RoomModePanel, startsRoom } from './roomModePanel';
import { NO_PRE_FLIGHT_INIT_OPTIONS, PRE_FLIGHT_CREATE_PARAMETER } from './util';

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

// The class preset's values. The guest policy is not one of them: it stays as created,
// the suite's server default.
export const CLASS_APPLIED: RoomSettings = {
  roomMode: 'class',
  disablePublicChat: false,
  presenterPolicy: 'requireApproval',
  lockOnJoin: true,
  webcamsOnlyForModerator: false,
  multiUserWhiteboardEnabled: true,
  muteOnStart: true,
  isRecording: false,
  guestPolicy: 'ALWAYS_ACCEPT',
};

export const MEETING_APPLIED: RoomSettings = {
  ...CLASS_APPLIED,
  roomMode: 'meeting',
  presenterPolicy: 'freeForAll',
  multiUserWhiteboardEnabled: false,
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

const OWN_LOCKED_QUERY = queryDocument([field('user_current', [field('locked')])]);

export const readLocked = async (page: Page): Promise<boolean> => {
  const data = await runQuery(page.page, OWN_LOCKED_QUERY);
  const rows = data.user_current as { locked: boolean }[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return rows[0].locked;
};

// A change made by hand, the way the moderator's crowd actions make it.
export const setMuted = (page: Page, muted: boolean) =>
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

// The room opens only once ROOM_MODE_APPLY_TIMEOUT (15 s) has passed after the join, so the
// waits for an open room after a held request cover that deadline; the constant scales with
// the suite's timeout multiplier.
const ROOM_OPEN_AFTER_DEADLINE_TIME = ELEMENT_WAIT_EXTRA_LONG_TIME * 2;

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
    let guestPolicySent = 0;
    await routeOperation(page, 'SetPolicy', ({ server, message }) => {
      guestPolicySent += 1;
      server.send(message);
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    // The room opens only once the mode is recorded, so this read is settled.
    expect(await readRoomSettings(this.modPage), 'should apply the class preset once the room starts').toEqual(
      CLASS_APPLIED,
    );
    expect(guestPolicySent, 'should not send the guest policy the moderator left as it was').toBe(0);
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
    // The room is created without the lock on join, so a lock on the viewer shows the applied one reached them.
    await expect(async () => {
      expect(
        await readLocked(this.userPage),
        'should lock a viewer who joins later under the lock on join the class preset applied',
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
    const held: RoutedOperation[] = [];
    await routeOperation(page, 'SetRoomMode', (operation) => {
      // Held and never released.
      held.push(operation);
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await expect
      .poll(() => held.length, {
        message: 'should hold the room mode request back',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
    await this.modPage.waitForSelector(e.layoutContainer, ROOM_OPEN_AFTER_DEADLINE_TIME);
    await this.modPage.wasRemoved(
      e.preFlight,
      'should remove the pre-flight screen when the apply times out',
      ROOM_OPEN_AFTER_DEADLINE_TIME,
    );
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
    await this.modPage.waitForSelector(e.layoutContainer, ROOM_OPEN_AFTER_DEADLINE_TIME);
    await ensureProbe(this.modPage);

    held.splice(0).forEach(({ server, message }) => server.send(message));
    // The released lock settings land, while the steps after them are never sent.
    await expect(async () => {
      expect(await readRoomSettings(this.modPage), 'should apply the released lock settings').toMatchObject({
        disablePublicChat: false,
        presenterPolicy: 'requireApproval',
        lockOnJoin: true,
      });
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expectRoomModeStable(this.modPage, '', 'should not record the mode after the deadline');
    const settled = await readRoomSettings(this.modPage);
    expect(settled.webcamsOnlyForModerator, 'should keep the webcams as created after the deadline').toBe(true);
    expect(settled.muteOnStart, 'should not send the steps after the deadline').toBe(false);
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

  // Another moderator is already in the room: the pick is not applied at all, so the room
  // keeps the change that moderator made by hand, opens with no mode, and tells the moderator.
  async keepsRoomRunningByAnotherModerator(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    // Created muted on start, so the hand change below is one the class preset would undo.
    // bbb-web refuses a repeated key, hence the replace.
    const createParameter = CLASS_CREATE_PARAMETER.replace('muteOnStart=false', 'muteOnStart=true');
    await this.picksMode(page, 'class', createParameter, options);
    await this.initModPage2(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage2);

    expect((await setMuted(this.modPage2, false)).errors, 'should accept the change made by hand').toEqual([]);
    await expect(async () => {
      expect((await readRoomSettings(this.modPage2)).muteOnStart, 'should show the change made by hand').toBe(false);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await startsRoom(this.modPage);
    await this.modPage.hasText(
      e.toastContainer,
      'Another moderator is already in the room',
      'should say another moderator is already in the room',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expect(
      this.modPage.page.locator(e.toastContainer, { hasText: 'Another moderator set the room mode first' }),
      'should not say another moderator set the room mode first',
    ).toHaveCount(0);
    await ensureProbe(this.modPage);
    await expectRoomModeStable(this.modPage, '', 'should leave the room mode unset while another moderator is in');
    expect(
      await readRoomSettings(this.modPage),
      'should leave the room as created, with the change made by hand',
    ).toEqual(CLASS_ROOM_AS_CREATED);
  }

  // The second moderator sets the mode while the first one's join is held, so the join lands on a
  // room that already has one. If the join-time check were missing, the apply would start and the
  // running-room check would stop it with its own notice: the notice tells which guard fired.
  async keepsModeSetDuringJoin(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    const held: RoutedOperation[] = [];
    await routeOperation(page, 'UserJoin', (operation) => {
      held.push(operation);
    });

    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await this.modPage.waitAndClick(e.preFlightJoinButton);
    await expect
      .poll(() => held.length, {
        message: 'should hold the join request back',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);

    await this.initModPage2(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage2);
    const result = await setRoomMode(this.modPage2, 'meeting');
    expect(result.errors, 'should accept the room mode from the second moderator').toEqual([]);
    expect(result.data?.meetingSetRoomMode, 'should accept the room mode from the second moderator').toBe(true);

    held.splice(0).forEach(({ server, message }) => server.send(message));
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.hasText(
      e.toastContainer,
      'Another moderator set the room mode first',
      'should say another moderator set the room mode first',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expect(
      this.modPage.page.locator(e.toastContainer, { hasText: 'Another moderator is already in the room' }),
      'should not reach the running-room check',
    ).toHaveCount(0);
    await ensureProbe(this.modPage);
    await expectRoomModeStable(this.modPage, 'meeting', 'should keep the mode set while the moderator joined');
    expect(
      await readRoomSettings(this.modPage),
      'should keep the settings the room was created with, not the pick',
    ).toMatchObject({
      presenterPolicy: 'freeForAll',
      lockOnJoin: false,
      webcamsOnlyForModerator: true,
      disablePublicChat: true,
    });
  }

  // The room has no public chat to unlock, so the class preset leaves its lock as created.
  async leavesPublicChatLockedWithoutChat(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', `${CLASS_CREATE_PARAMETER}&disabledFeatures=chat`, options);
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    expect(
      await readRoomSettings(this.modPage),
      'should leave the public chat lock as created in a room without chat',
    ).toEqual({ ...CLASS_APPLIED, disablePublicChat: true });
  }

  // The guest policy the moderator edits is sent with the pick: the modes do not assert one.
  async appliesEditedGuestPolicy(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.picksMode(page, 'class', CLASS_CREATE_PARAMETER, options);
    await pickOption(this.modPage, e.preFlightRoomModeGuestPolicy, 'ASK_MODERATOR');
    await startsRoom(this.modPage);
    await ensureProbe(this.modPage);
    expect(await readRoomSettings(this.modPage), 'should apply the guest policy the moderator edited').toEqual({
      ...CLASS_APPLIED,
      guestPolicy: 'ASK_MODERATOR',
    });
  }
}
