import { expect, test } from '@playwright/test';

import {
  APOLLO_CLIENT_SETTINGS_MODULE,
  field,
  isApolloClientExposed,
  type MutationResult,
  queryDocument,
  runMutation,
  runQuery,
  stringVarMutation,
} from '../core/apolloProbe';
import { Create } from '../breakout/create';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import { PreFlight } from './preFlight';
import { NO_PRE_FLIGHT_INIT_OPTIONS, PRE_FLIGHT_INIT_OPTIONS } from './util';

// Read the way the client reads it, before and after the join: through user_current,
// under the operation name the middleware already lets through before joining.
const ROOM_MODE_QUERY = queryDocument(
  [field('user_current', [field('joined'), field('meeting', [field('roomMode')])])],
  'userCurrentSubscription',
);

interface RoomModeRead {
  joined: boolean;
  meeting: { roomMode: string };
}

const readRoomMode = async (page: Page): Promise<RoomModeRead> => {
  const data = await runQuery(page.page, ROOM_MODE_QUERY);
  const rows = data.user_current as RoomModeRead[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return rows[0];
};

const getRoomMode = async (page: Page): Promise<string> => (await readRoomMode(page)).meeting.roomMode;

interface SetRoomModeOutcome {
  accepted: boolean;
  errors: string[];
}

// The action answers true once it has queued the change.
const setRoomMode = async (page: Page, roomMode: string): Promise<SetRoomModeOutcome> => {
  const result: MutationResult = await runMutation(page.page, stringVarMutation('meetingSetRoomMode', { roomMode }));
  return { accepted: result.data?.meetingSetRoomMode === true, errors: result.errors };
};

export const expectRoomMode = async (page: Page, expected: string, message: string): Promise<void> => {
  await expect(async () => {
    expect(await getRoomMode(page), message).toBe(expected);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

// Akka drops a command it refuses without answering, so the absence of a change
// can only be checked by sampling across a window.
const ROOM_MODE_SAMPLE_INTERVAL = 250;

const expectRoomModeStable = async (page: Page, expected: string, message: string): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < ELEMENT_WAIT_TIME) {
    // eslint-disable-next-line no-await-in-loop
    expect(await getRoomMode(page), message).toBe(expected);
    // eslint-disable-next-line no-await-in-loop
    await page.page.waitForTimeout(ROOM_MODE_SAMPLE_INTERVAL);
  }
};

const APOLLO_EXPOSURE_SKIP_REASON =
  'requires window.__APOLLO_CLIENT__ for the room mode probe: the meeting enables it through ' +
  'clientSettingsOverride on create, which the server honours only with ' +
  'allowOverrideClientSettingsOnCreateCall=true (or with a development bundle)';

export const ensureProbe = async (page: Page): Promise<void> => {
  test.skip(!(await isApolloClientExposed(page.page, ELEMENT_WAIT_LONGER_TIME)), APOLLO_EXPOSURE_SKIP_REASON);
};

export class RoomMode extends PreFlight {
  // The meeting enables the probe on create; requiring it is up to the cases
  // that read or write the room mode.
  protected async initModPageWithProbeModule(
    page: Parameters<PreFlight['initModPage']>[0],
    options: InitExtraPageOptionsProps = {},
  ) {
    await super.initModPage(page, { createModules: APOLLO_CLIENT_SETTINGS_MODULE, ...options });
  }

  async initModPage(page: Parameters<PreFlight['initModPage']>[0], options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithProbeModule(page, options);
    await ensureProbe(this.modPage);
  }

  async initJoinedViewer() {
    await this.initUserPage(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    await ensureProbe(this.userPage);
  }

  async setByModerator(roomMode: string) {
    expect(await setRoomMode(this.modPage, roomMode), 'should accept the room mode from a moderator').toEqual({
      accepted: true,
      errors: [],
    });
  }

  async setsModeForEveryone() {
    await this.initJoinedViewer();
    await expectRoomMode(this.modPage, '', 'should start with no room mode');

    await this.setByModerator('class');

    await expectRoomMode(this.modPage, 'class', 'should store the room mode set by the moderator');
    await expectRoomMode(this.userPage, 'class', 'should show the room mode to the other clients');
  }

  async readsModeBeforeJoining() {
    await this.setByModerator('meeting');

    await this.initUserPageWithPreFlight();
    await ensureProbe(this.userPage);
    await expectRoomMode(this.userPage, 'meeting', 'should show the room mode on the pre-flight, before joining');
    expect((await readRoomMode(this.userPage)).joined, 'should read the room mode without having joined').toBe(false);

    await this.setByModerator('class');
    await expectRoomMode(this.userPage, 'class', 'should show a room mode changed while still on the pre-flight');
    await this.userPage.hasElement(e.preFlight, 'should still be on the pre-flight after reading the room mode');
  }

  async refusesModeFromViewer() {
    await this.initJoinedViewer();
    await this.setByModerator('class');
    await expectRoomMode(this.userPage, 'class', 'should show the room mode to the viewer');

    const { accepted, errors } = await setRoomMode(this.userPage, 'meeting');

    expect(accepted, 'should not accept the room mode from a viewer').toBe(false);
    expect(errors.join(' '), 'should refuse the room mode from a viewer').toMatch(/not moderator/i);
    // This error is thrown by bbb-graphql-actions before it publishes anything to
    // Redis, so no change is in flight and the value can be read right away.
    expect(await getRoomMode(this.modPage), 'should keep the room mode a viewer tried to change').toBe('class');
  }

  // graphql-actions only checks the role, so a moderator who has not joined yet
  // gets true; akka then drops the command. The code that applies a mode relies
  // on this: it has to wait for the join before calling.
  async ignoresModeBeforeJoining() {
    await this.initModPage2(this.context, PRE_FLIGHT_INIT_OPTIONS);
    await this.modPage2.hasElement(
      e.preFlight,
      'should display the pre-flight screen to the second moderator',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await ensureProbe(this.modPage2);

    expect(
      await setRoomMode(this.modPage2, 'class'),
      'should answer a moderator still on the pre-flight like any other moderator',
    ).toEqual({ accepted: true, errors: [] });
    await expectRoomModeStable(this.modPage, '', 'should not store a room mode sent before joining');

    await this.modPage2.waitAndClick(e.preFlightJoinButton);
    await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await expectRoomMode(this.modPage2, '', 'should join normally, into a room still not configured');
    expect(await setRoomMode(this.modPage2, 'class'), 'should accept the room mode once joined').toEqual({
      accepted: true,
      errors: [],
    });
    await expectRoomMode(this.modPage, 'class', 'should store the room mode from the moderator who joined');
  }

  // Akka refuses breakouts too, but only after the call has answered true, and
  // with ejectOnViolation on it would eject the moderator from the breakout.
  async refusesModeInBreakout() {
    await this.initJoinedViewer();
    const breakout = new Create(this.browser, this.context);
    breakout.modPage = this.modPage;
    breakout.userPage = this.userPage;
    const breakoutPage = new Page(this.browser, await breakout.joinAssignedBreakoutAsModerator());
    await ensureProbe(breakoutPage);

    const { accepted, errors } = await setRoomMode(breakoutPage, 'class');

    expect(accepted, 'should not accept the room mode in a breakout room').toBe(false);
    expect(errors.join(' '), 'should refuse the room mode in a breakout room').toMatch(/breakout room/i);
    expect(await getRoomMode(breakoutPage), 'should keep the breakout room unconfigured').toBe('');
  }

  async refusesInvalidMode() {
    await this.setByModerator('class');
    await expectRoomMode(this.modPage, 'class', 'should store the room mode set by the moderator');

    const expectRefused = async (roomMode: string) => {
      const { accepted, errors } = await setRoomMode(this.modPage, roomMode);
      expect(accepted, `should not accept the room mode "${roomMode}"`).toBe(false);
      expect(errors.join(' '), `should refuse the room mode "${roomMode}"`).toMatch(/invalid room mode/i);
    };
    await expectRefused('Class');
    await expectRefused('a'.repeat(33));
    // Refused by bbb-graphql-actions before anything reaches Redis.
    expect(await getRoomMode(this.modPage), 'should keep the room mode after invalid ones').toBe('class');
  }

  async keepsModeAcrossReload() {
    await this.setByModerator('class');
    await expectRoomMode(this.modPage, 'class', 'should store the room mode set by the moderator');

    await this.modPage.page.reload();
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage);
    await expectRoomMode(this.modPage, 'class', 'should keep the room mode after the moderator reloads');
  }
}
