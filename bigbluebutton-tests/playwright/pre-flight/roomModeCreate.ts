import { type APIRequestContext, expect, Page as PlaywrightPage, test } from '@playwright/test';
import * as xml2js from 'xml2js';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { createMeeting, createMeetingUrl } from '../core/helpers';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import {
  ensureProbe,
  expectRoomBaseSettingsClosedBeforeJoining,
  expectRoomMode,
  expectRoomModeOnCreate,
  expectRoomModeStable,
  readRoomModeOnCreate,
} from './roomMode';
import {
  expectSelected,
  hasNoPanel,
  hasPanel,
  ROOM_MODES_OFF_JOIN_PARAMETER,
  RoomModePanel,
  roomModesOnCreate,
  startsRoom,
} from './roomModePanel';
import { PRE_FLIGHT_CREATE_PARAMETER, ROOM_MODE_PANEL_INIT_OPTIONS } from './util';

const createdWith = (roomMode: string): InitExtraPageOptionsProps => ({
  createParameter: `${PRE_FLIGHT_CREATE_PARAMETER}&roomMode=${roomMode}`,
});

const INVALID_ROOM_MODES = [
  { roomMode: 'Class', why: 'an upper-case letter' },
  { roomMode: '1class', why: 'a leading digit' },
  { roomMode: `c${'l'.repeat(32)}`, why: '33 characters' },
];

// bbb-web answers a failed create in JSON to a client that prefers JSON, as axios
// does. The test's request context gets XML, as in the api/ cases.
const createResponse = async (request: APIRequestContext, createParameter: string) => {
  const response = await request.get(createMeetingUrl(createParameter));
  expect(response.status(), 'should answer the create call').toBe(200);
  return (await xml2js.parseStringPromise(await response.text())).response as {
    returncode: string[];
    messageKey?: string[];
  };
};

export class RoomModeCreate extends RoomModePanel {
  // Meeting is not the first card, so a pick of the first mode would not pass.
  // The %09 is a tab: bbb-web strips control characters before it checks and
  // stores the value, so the room gets plain meeting.
  async preSelectsModeFromCreate(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithPanel(page, { ...createdWith('meeting%09'), ...options });
    await ensureProbe(this.modPage);

    await test.step('Reads the mode from the create before the join', async () => {
      const { roomMode, roomModeOnCreate } = await readRoomModeOnCreate(this.modPage);
      expect(
        { roomMode, roomModeOnCreate },
        'should give the moderator on the pre-flight the mode from the create, with no mode applied',
      ).toEqual({ roomMode: '', roomModeOnCreate: 'meeting' });
      await expectRoomBaseSettingsClosedBeforeJoining(this.modPage);
    });

    await test.step('The panel opens with that mode picked', async () => {
      await hasPanel(this.modPage);
      await expectSelected(this.modPage, e.preFlightRoomModeMeeting);
      await this.modPage.hasElement(e.preFlightRoomModeSelected, 'should show the pre-selected mode beside the cards');
    });

    await test.step('Starting the room applies it', async () => {
      await startsRoom(this.modPage);
      await expectRoomMode(this.modPage, 'meeting', 'should apply the pre-selected mode once the room starts');
      await expectRoomModeOnCreate(this.modPage, 'meeting', 'should keep the mode from the create after the join');
    });
  }

  async appliesNothingWithPanelOff(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    // The room has the panel on, so only the join's switch keeps it away.
    await this.initModPage(page, {
      ...roomModesOnCreate(true),
      ...createdWith('class'),
      joinParameter: ROOM_MODES_OFF_JOIN_PARAMETER,
      ...options,
    });
    await ensureProbe(this.modPage);
    await this.modPage.hasElement(e.preFlight, 'should display the pre-flight screen', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await hasNoPanel(this.modPage, 'should not display the room mode panel to a moderator who joins with it off');
    await expectRoomModeOnCreate(this.modPage, 'class', 'should still give the room the mode from the create');

    await startsRoom(this.modPage);
    await expectRoomModeStable(this.modPage, '', 'should apply nothing with the room mode panel off');

    await test.step('A later moderator starts with the mode left as it was', async () => {
      await this.initModPage2(this.context, ROOM_MODE_PANEL_INIT_OPTIONS);
      await hasPanel(this.modPage2);
      await expectSelected(this.modPage2, e.preFlightRoomModeClass);
      await startsRoom(this.modPage2);
      // Any notice is up by the time the room opens; the sampling leaves it time
      // to render.
      await expectRoomModeStable(this.modPage, '', 'should leave the running room unconfigured');
      await expect(
        this.modPage2.page.locator(e.toastContainer, { hasText: 'Another moderator is already in the room' }),
        'should not tell a later moderator about a mode they did not pick',
      ).toHaveCount(0);
    });

    // Positive control: the same start reaches the running-room check.
    await test.step('A later moderator who picks the same mode again is told', async () => {
      await this.initModPage2(this.context, { ...ROOM_MODE_PANEL_INIT_OPTIONS, fullName: 'Moderator3' });
      await hasPanel(this.modPage2);
      await this.modPage2.waitAndClick(e.preFlightRoomModeMeeting);
      await this.modPage2.waitAndClick(e.preFlightRoomModeClass);
      await expectSelected(this.modPage2, e.preFlightRoomModeClass);
      await startsRoom(this.modPage2);
      await this.modPage2.hasText(
        e.toastContainer,
        'Another moderator is already in the room',
        'should tell a moderator who picked the mode that the room is already running',
        ELEMENT_WAIT_LONGER_TIME,
      );
      await expectRoomModeStable(this.modPage, '', 'should still leave the running room unconfigured');
    });
  }

  async keepsUnknownModeWithoutPick(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithPanel(page, { ...createdWith('webinar'), ...options });
    await ensureProbe(this.modPage);
    await expectRoomModeOnCreate(this.modPage, 'webinar', 'should accept a well-formed mode the client does not offer');
    await hasPanel(this.modPage);
    await expectSelected(this.modPage, null);
    await this.modPage.hasElement(e.preFlightRoomModeEmptyState, 'should show the empty state for an unknown mode');
  }
}

// API only: the create fails before any room exists.
export const expectMalformedRoomModesRefused = async (request: APIRequestContext) => {
  for (const { roomMode, why } of INVALID_ROOM_MODES) {
    // eslint-disable-next-line no-await-in-loop
    const response = await createResponse(request, `roomMode=${roomMode}`);
    expect(response.returncode, `should refuse a room mode with ${why}`).toEqual(['FAILED']);
    expect(response.messageKey, `should report a room mode with ${why} as a validation error`).toEqual([
      'validationError',
    ]);
  }
  // Positive control: the same call goes through with an empty mode, the default.
  expect(await createMeeting('roomMode='), 'should create the room with an empty room mode').toBeTruthy();
};
