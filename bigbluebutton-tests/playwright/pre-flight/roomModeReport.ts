import { expect, Page as PlaywrightPage, test } from '@playwright/test';

import { field, queryDocument, runQuery } from '../core/apolloProbe';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getApiCallUrl } from '../core/helpers';
import { Page } from '../core/page';
import { readArchivedEvents, readRecordedEvents, type RecordedEvent } from '../core/recordedEvents';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import { CLASS_CREATE_PARAMETER, ensureProbe, expectRoomMode, readRoomSettings } from './roomMode';
import { MEETING_APPLIED } from './roomModeApply';
import { hasNoPanel } from './roomModePanel';
import {
  expectRoomSettings,
  openRoomModeTab,
  readLockSettings,
  RoomModeSwitch,
  switchToMeeting,
} from './roomModeSwitch';
import { ROOM_MODE_PANEL_INIT_OPTIONS } from './util';

const ROOM_CONFIGURED_EVENT = 'RoomConfiguredEvent';

const IDS_QUERY = queryDocument([field('user_current', [field('userId'), field('meeting', [field('meetingId')])])]);

interface Ids {
  userId: string;
  meetingId: string;
}

// The internal ids the server records events under.
const readIds = async (page: Page): Promise<Ids> => {
  const data = await runQuery(page.page, IDS_QUERY);
  const rows = data.user_current as { userId: string; meeting: { meetingId: string } }[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return { userId: rows[0].userId, meetingId: rows[0].meeting.meetingId };
};

// The settings a room mode controls, read the way the client reads them, in the shape
// the room keeps its creation values in (meeting.roomBaseSettings).
const readModeSettings = async (page: Page) => {
  // The probe's read carries Apollo's __typename, which is not a setting.
  const lockSettings = Object.fromEntries(
    Object.entries(await readLockSettings(page)).filter(([key]) => key !== '__typename'),
  );
  const room = await readRoomSettings(page);
  return {
    lockSettings,
    usersPolicies: {
      webcamsOnlyForModerator: room.webcamsOnlyForModerator,
      guestPolicy: room.guestPolicy,
      multiUserWhiteboardEnabled: room.multiUserWhiteboardEnabled,
    },
    voiceSettings: { muteOnStart: room.muteOnStart },
  };
};

// The room keeps its events whether or not it is recorded, so akka records them.
const KEEP_EVENTS_CREATE_PARAMETER = `${CLASS_CREATE_PARAMETER}&meetingKeepEvents=true`;

const READ_EVENTS_SKIP_REASON =
  "requires the server's Redis on the test host (redis-cli), as in CI: the meeting's recorded events are read from it";

const roomConfiguredEvents = (events: RecordedEvent[]) =>
  events.filter(({ eventName }) => eventName === ROOM_CONFIGURED_EVENT);

const readRoomConfigured = (meetingId: string) => roomConfiguredEvents(readRecordedEvents(meetingId) ?? []);

const expectRoomConfiguredCount = async (meetingId: string, count: number, message: string) => {
  await expect(() => {
    expect(readRoomConfigured(meetingId), message).toHaveLength(count);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

const ROOM_CONFIGURED_SAMPLE_INTERVAL = 250;

// A mode applied again lands within the applier's deadline, so the absence of a new
// record is checked by sampling across that window.
const expectRoomConfiguredCountStable = async (page: Page, meetingId: string, count: number, message: string) => {
  const start = Date.now();
  while (Date.now() - start < ELEMENT_WAIT_EXTRA_LONG_TIME) {
    expect(readRoomConfigured(meetingId), message).toHaveLength(count);
    // eslint-disable-next-line no-await-in-loop
    await page.page.waitForTimeout(ROOM_CONFIGURED_SAMPLE_INTERVAL);
  }
};

const expectRecordedAs = (event: RecordedEvent, expected: { roomMode: string; userId: string; meetingId: string }) => {
  expect(event.roomMode, 'should record the mode').toBe(expected.roomMode);
  expect(event.userId, 'should record who applied the mode').toBe(expected.userId);
  expect(event.meetingId, 'should record the meeting').toBe(expected.meetingId);
};

export class RoomModeReport extends RoomModeSwitch {
  // Class started from the pre-flight, on a server whose recorded events the test can read.
  private async startsClassWithRecordedEvents(page: PlaywrightPage, options: InitExtraPageOptionsProps) {
    const startedAt = Date.now();
    await this.startsClass(page, { createParameter: KEEP_EVENTS_CREATE_PARAMETER, ...options });
    const ids = await readIds(this.modPage);
    const events = readRecordedEvents(ids.meetingId);
    test.skip(!events, READ_EVENTS_SKIP_REASON);
    expect(
      events?.some(({ eventName }) => eventName === 'ParticipantJoinEvent'),
      "should record the meeting's events, the moderator's join among them",
    ).toBe(true);
    return { ...ids, startedAt };
  }

  // Each apply is recorded once: from the pre-flight, a change in the Room modes tab, and
  // the same mode applied again there with an edit.
  async recordsEveryApply(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    const { userId, meetingId, startedAt } = await this.startsClassWithRecordedEvents(page, options);
    let classSettings: Awaited<ReturnType<typeof readModeSettings>>;

    await test.step('applying a mode records it, with its settings', async () => {
      await expectRoomConfiguredCount(meetingId, 1, 'should record the applied mode');
      const [event] = readRoomConfigured(meetingId);
      expectRecordedAs(event, { roomMode: 'class', userId, meetingId });
      classSettings = await readModeSettings(this.modPage);
      expect(JSON.parse(event.settings), 'should record the settings the class mode applied').toEqual(classSettings);
      expect(Number(event.timestampUTC), 'should record when the mode was applied').toBeGreaterThanOrEqual(startedAt);
      expect(Number(event.timestampUTC), 'should record when the mode was applied').toBeLessThanOrEqual(Date.now());
    });

    await test.step('changing the mode records it again', async () => {
      await switchToMeeting(this.modPage);
      await expectRoomSettings(this.modPage, MEETING_APPLIED, 'should apply the meeting preset');
      await expectRoomConfiguredCount(meetingId, 2, 'should record the changed mode');
      const [first, second] = readRoomConfigured(meetingId);
      expect(JSON.parse(first.settings), 'should keep the class record as it was').toEqual(classSettings);
      expectRecordedAs(second, { roomMode: 'meeting', userId, meetingId });
      expect(JSON.parse(second.settings), 'should record the settings the meeting mode applied').toEqual(
        await readModeSettings(this.modPage),
      );
    });

    await test.step('applying the same mode with an edit records it again', async () => {
      await openRoomModeTab(this.modPage);
      await this.modPage.waitAndClick(e.settingsRoomModeMeeting);
      await this.modPage.waitAndClick(e.settingsRoomModeEditMeeting);
      await this.modPage.hasElement(e.settingsRoomModeSummary, "should open the meeting mode's summary");
      await this.modPage.page.locator(e.settingsRoomModeWhiteboard).check();
      await this.modPage.waitAndClick(e.settingsRoomModeApplyChangesButton);
      await this.modPage.wasRemoved(e.settingsRoomModeSummary, 'should go back to the modes once the edits are kept');
      await this.modPage.waitAndClick(e.settingsRoomModeChangeButton);
      await this.modPage.wasRemoved(e.settingsRoomModePanel, 'should close the settings once the mode is applied');
      await expectRoomSettings(
        this.modPage,
        { ...MEETING_APPLIED, multiUserWhiteboardEnabled: true },
        'should apply the meeting mode again with the whiteboard as edited',
      );
      await expectRoomConfiguredCount(meetingId, 3, 'should record the mode applied again');
      const [, , third] = readRoomConfigured(meetingId);
      expectRecordedAs(third, { roomMode: 'meeting', userId, meetingId });
      expect(JSON.parse(third.settings), 'should record the whiteboard as edited').toEqual(
        await readModeSettings(this.modPage),
      );
    });

    await expectRoomConfiguredCountStable(this.modPage, meetingId, 3, 'should record each apply once');
  }

  // Nothing is applied again on a reload or when a second moderator joins, and the record
  // stays with the meeting's events once it ends: in Redis until the recording is archived,
  // then in the archived events.xml.
  async keepsTheRecordAsItIs(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    const { meetingId } = await this.startsClassWithRecordedEvents(page, options);
    await expectRoomConfiguredCount(meetingId, 1, 'should record the applied mode');

    await test.step('a reload or a second moderator records nothing', async () => {
      await this.modPage.page.reload();
      await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
      await ensureProbe(this.modPage);
      await expectRoomMode(this.modPage, 'class', 'should keep the class mode after a reload');
      // Through the pre-flight with the room mode panel on, the way a moderator arrives.
      await this.initModPage2(this.context, ROOM_MODE_PANEL_INIT_OPTIONS);
      await this.modPage2.hasElement(e.preFlight, 'should display the pre-flight', ELEMENT_WAIT_EXTRA_LONG_TIME);
      await hasNoPanel(this.modPage2, 'should not offer the room mode panel in a room that has a mode');
      await this.modPage2.waitAndClick(e.preFlightJoinButton);
      await this.modPage2.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
      await expectRoomConfiguredCountStable(
        this.modPage,
        meetingId,
        1,
        'should record nothing more after a reload and a second moderator',
      );
    });

    await test.step("the record stays in the meeting's events after the end", async () => {
      const end = await this.modPage.page.request.get(getApiCallUrl('end', { meetingID: this.modPage.meetingId }));
      expect(end.ok(), 'should end the meeting').toBe(true);
      await this.modPage.hasElement(e.meetingEndedModal, 'should end the meeting', ELEMENT_WAIT_LONGER_TIME);
      await expect(() => {
        const events = readRecordedEvents(meetingId) ?? readArchivedEvents(meetingId);
        expect(
          events?.some(({ eventName }) => eventName === 'EndAndKickAllEvent'),
          "should read the meeting's events from after the end",
        ).toBe(true);
        expect(
          roomConfiguredEvents(events ?? []).map(({ roomMode }) => roomMode),
          "should keep the applied mode in the meeting's events",
        ).toEqual(['class']);
      }).toPass({ timeout: ELEMENT_WAIT_TIME });
    });
  }
}
