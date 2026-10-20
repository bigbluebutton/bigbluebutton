import { expect } from '@playwright/test';

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
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import { PreFlight } from './preFlight';
import { NO_PRE_FLIGHT_INIT_OPTIONS } from './util';

// Read the way the client reads it, before and after the join: through user_current,
// under the operation name the middleware already lets through before joining.
const ROOM_MODE_QUERY = queryDocument(
  [field('user_current', [field('meeting', [field('roomMode')])])],
  'userCurrentSubscription',
);

const getRoomMode = async (page: Page): Promise<string> => {
  const data = await runQuery(page.page, ROOM_MODE_QUERY);
  const rows = data.user_current as { meeting: { roomMode: string } }[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return rows[0].meeting.roomMode;
};

interface SetRoomModeOutcome {
  accepted: boolean;
  errors: string[];
}

// The action answers true once it has queued the change. A refusal can surface as
// returned errors or as a rejected call, so both count as errors.
const setRoomMode = async (page: Page, roomMode: string): Promise<SetRoomModeOutcome> => {
  try {
    const result: MutationResult = await runMutation(page.page, stringVarMutation('meetingSetRoomMode', { roomMode }));
    return { accepted: result.data?.meetingSetRoomMode === true, errors: result.errors };
  } catch (err) {
    return { accepted: false, errors: [(err as Error).message] };
  }
};

const expectRoomMode = async (page: Page, expected: string, message: string): Promise<void> => {
  await expect(async () => {
    expect(await getRoomMode(page), message).toBe(expected);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

// The meeting is created with the probe enabled, so its absence is a failure, not a skip.
const ensureProbe = async (page: Page): Promise<void> => {
  expect(
    await isApolloClientExposed(page.page, ELEMENT_WAIT_LONGER_TIME),
    'should expose the in-page Apollo client for the server-state probe',
  ).toBe(true);
};

export class RoomMode extends PreFlight {
  async initModPage(page: Parameters<PreFlight['initModPage']>[0], options: InitExtraPageOptionsProps = {}) {
    await super.initModPage(page, { createModules: APOLLO_CLIENT_SETTINGS_MODULE, ...options });
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

  async keepsModeAcrossReloadAndRejoin() {
    await this.initJoinedViewer();
    await this.setByModerator('class');
    await expectRoomMode(this.userPage, 'class', 'should show the room mode to the viewer');

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.otherUserMoreOptionsButton);
    await this.modPage.waitAndClick(e.removeUser);
    await this.modPage.waitAndClick(e.removeUserConfirmationBtn);
    await this.modPage.wasRemoved(e.userListItem, 'should remove the viewer from the meeting');

    await this.initJoinedViewer();
    await expectRoomMode(this.userPage, 'class', 'should show the room mode to a viewer rejoining after removal');

    // Last, so no click lands on the audio modal the reload brings back.
    await this.modPage.page.reload();
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await ensureProbe(this.modPage);
    await expectRoomMode(this.modPage, 'class', 'should keep the room mode after the moderator reloads');
  }
}
