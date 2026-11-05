import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { Join } from '../breakout/join';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getMeetingInfo } from '../core/endpoints';
import { getOwnUserId, graphql, readRows, sendMutation, waitForServerToCatchUp } from '../core/graphql';
import {
  createMeeting,
  createMeetingPromise,
  endMeetings,
  getApiCallUrl,
  getRandomInt,
  requestApiCall,
  type XmlElement,
} from '../core/helpers';
import { Page } from '../core/page';
import { parameters } from '../core/parameters';

// meetingExpireIfNoUserJoinedInMinutes=1 plus the margin akka-apps takes to notice it
const PARENT_EXPIRY_TIMEOUT = 150000;
const pollOptions = { timeout: ELEMENT_WAIT_LONGER_TIME };

// The mutation the breakout panel sends (bigbluebutton-html5/imports/ui/components/
// breakout-room/mutations.ts). Values travel as variables, as in the client.
export const BREAKOUT_ROOM_CREATE =
  'mutation BreakoutRoomCreate($record: Boolean!, $captureNotes: Boolean!, $captureSlides: Boolean!, ' +
  '$durationInSeconds: Int!, $sendInviteToModerators: Boolean!, $inheritLockSettings: Boolean!, ' +
  '$rooms: [BreakoutRoom]!) { breakoutRoomCreate(record: $record, captureNotes: $captureNotes, ' +
  'captureSlides: $captureSlides, durationInSeconds: $durationInSeconds, ' +
  'sendInviteToModerators: $sendInviteToModerators, inheritLockSettings: $inheritLockSettings, rooms: $rooms) }';
// The rooms akka-apps holds for the meeting, as a moderator of that meeting reads them
const BREAKOUT_ROOMS = 'subscription { breakoutRoom { breakoutRoomMeetingId sequence } }';

interface BreakoutRoomRow {
  breakoutRoomMeetingId: string;
  sequence: number;
}

// The variables the panel sends for `roomCount` rooms with the default names
// (sidebar-create-breakout/component.tsx handleCreateRoom); `firstRoomUsers`
// are assigned to the first room.
export function breakoutRoomCreateVariables(
  roomCount: number,
  {
    record = false,
    firstRoomUsers = [],
    inheritLockSettings = false,
  }: { record?: boolean; firstRoomUsers?: string[]; inheritLockSettings?: boolean } = {},
) {
  const rooms = Array.from({ length: roomCount }, (_, index) => {
    const sequence = index + 1;
    const name = `Room ${sequence}`;
    return {
      name,
      sequence,
      captureNotesFilename: `Room_${sequence}_Notes`,
      captureSlidesFilename: `Room_${sequence}_Whiteboard`,
      isDefaultName: true,
      users: sequence === 1 ? firstRoomUsers : [],
      freeJoin: false,
      shortName: name,
      allPages: false,
      presId: '',
    };
  });
  return {
    record,
    captureNotes: false,
    captureSlides: false,
    durationInSeconds: 900,
    sendInviteToModerators: false,
    inheritLockSettings,
    rooms,
  };
}

export const sendBreakoutRoomCreate = (page: Page, variables: ReturnType<typeof breakoutRoomCreateVariables>) =>
  sendMutation(page, BREAKOUT_ROOM_CREATE, 'breakoutRoomCreate', variables);

const readBreakoutRooms = (page: Page) => readRows<BreakoutRoomRow>(page, BREAKOUT_ROOMS, 'breakoutRoom');

// API calls answered in XML (an error answered to axios' default Accept header comes as JSON)
async function getMeetingInfoXml(request: APIRequestContext, meetingID: string): Promise<XmlElement> {
  return (await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }))).response;
}

// The room IDs getMeetingInfo lists under the meeting's <breakoutRooms>
function breakoutRoomIdsOf(meeting: XmlElement): string[] {
  const rooms = meeting.breakoutRooms?.[0] as XmlElement | undefined;
  return (rooms?.breakout ?? []) as string[];
}

const listedBreakoutRoomIds = async (request: APIRequestContext, parentID: string) =>
  breakoutRoomIdsOf(await getMeetingInfoXml(request, parentID));

// The <metadata> entries of a getMeetingInfo answer (an empty element parses as text)
function metadataOf(meeting: XmlElement): XmlElement {
  const metadata = meeting.metadata?.[0];
  return typeof metadata === 'object' ? metadata : {};
}

// The request was handled and created no room: akka-apps holds none and bbb-web lists none
async function expectNoRooms(observer: Page, meetingID: string, request: APIRequestContext, description: string) {
  await waitForServerToCatchUp(observer);
  expect(await readBreakoutRooms(observer), `${description}: the server should hold no breakout room`).toEqual([]);
  const meeting = await getMeetingInfoXml(request, meetingID);
  expect(meeting.returncode, `${description}: getMeetingInfo should find the meeting`).toEqual(['SUCCESS']);
  expect(breakoutRoomIdsOf(meeting), `${description}: getMeetingInfo should list no breakout room`).toEqual([]);
}

async function getMeetingsXml(request: APIRequestContext): Promise<XmlElement[]> {
  const { response } = await requestApiCall(request, getApiCallUrl('getMeetings', null));
  expect(response.returncode, 'getMeetings should succeed').toEqual(['SUCCESS']);
  return ((response.meetings?.[0] as XmlElement | undefined)?.meeting ?? []) as XmlElement[];
}

export class APIBreakout extends Join {
  // Attempt to use API to create a breakout room without a parent
  static async testBreakoutWithoutParent() {
    const { data, status } = await createMeetingPromise('isBreakout=true&sequence=1');

    expect(status, 'should return status 200 from the request').toEqual(200);
    expect(data.response.returncode, 'should return "FAILED" as returncode value').toEqual('FAILED');
    expect(data.response.messageKey, 'should return "parentMeetingIDMissing" as messageKey value').toEqual(
      'parentMeetingIDMissing',
    );
  }

  // Attempt to use API to create a break room without a sequence number
  static async testBreakoutWithoutSequenceNumber(request: APIRequestContext) {
    const parentMeetingId = await createMeeting();
    try {
      const { data, status } = await createMeetingPromise(`isBreakout=true&parentMeetingID=${parentMeetingId}`).catch(
        (error) => error.response,
      );

      expect(status, 'should return status 200 from the request').toEqual(200);
      expect(data.response.returncode, 'should return "FAILED" as returncode value').toEqual('FAILED');
    } finally {
      await endMeetings(request, [parentMeetingId]);
    }
  }

  // Attempt to use API to create a break room with a sequence that is not a number
  static async testBreakoutWithNonNumericSequence(request: APIRequestContext) {
    const parentMeetingId = await createMeeting();
    try {
      const { data, status } = await createMeetingPromise(
        `isBreakout=true&parentMeetingID=${parentMeetingId}&sequence=abc`,
      ).catch((error) => error.response);

      expect(status, 'should return status 200 from the request').toEqual(200);
      expect(data.response.returncode, 'should return "FAILED" as returncode value').toEqual('FAILED');
    } finally {
      await endMeetings(request, [parentMeetingId]);
    }
  }

  // Attempt to use API to create a break room with a non-existent parent meeting
  static async testBreakoutWithNonexistentParent() {
    const { data, status } = await createMeetingPromise('isBreakout=true&parentMeetingID=0000000&sequence=1');

    expect(status, 'should return status 200 from the request').toEqual(200);
    expect(data.response.returncode, 'should return "FAILED" as returncode value').toEqual('FAILED');
    expect(data.response.messageKey, 'should return "parentMeetingDoesNotExist" as messageKey value').toEqual(
      'parentMeetingDoesNotExist',
    );
  }

  // Check that breakout rooms created via the GUI appear properly in the API's meeting info
  private async getBreakoutRoomsInfo() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    const { data } = await getMeetingInfo(this.modPage.meetingId);
    expect(data.response.returncode).toEqual(['SUCCESS']);
    expect(data.response.isBreakout).toEqual(['false']);
    const breakoutRoomIds = data.response.breakoutRooms?.[0]?.breakout ?? [];
    expect(breakoutRoomIds, 'the parent meeting should list the two breakout rooms').toHaveLength(2);

    const rooms = await Promise.all(
      breakoutRoomIds.map(async (breakoutRoomId) => (await getMeetingInfo(breakoutRoomId)).data.response),
    );
    rooms.forEach((room) => {
      expect(room).toMatchObject({
        returncode: ['SUCCESS'],
        isBreakout: ['true'],
        parentMeetingID: data.response.internalMeetingID,
      });
    });
    expect(rooms.map((room) => room.sequence?.[0]).sort()).toEqual(['1', '2']);
    return rooms;
  }

  async testBreakoutMeetingInfoNoJoins() {
    // We have two breakout rooms, but neither user has joined a breakout room.
    const rooms = await this.getBreakoutRoomsInfo();
    rooms.forEach((room) => {
      expect(room).toMatchObject({ running: ['false'], participantCount: ['0'], hasUserJoined: ['false'] });
    });
  }

  async testBreakoutMeetingInfoOneJoin() {
    if (!this?.userPage) throw new Error('userPage not initialized');
    // We have two breakout rooms, and the attendee has joined the first one.
    await expect(async () => {
      const rooms = await this.getBreakoutRoomsInfo();
      const [first, second] = [...rooms].sort((a, b) => Number(a.sequence?.[0]) - Number(b.sequence?.[0]));
      expect(first).toMatchObject({
        running: ['true'],
        participantCount: ['1'],
        hasUserJoined: ['true'],
        attendees: [{ attendee: [expect.objectContaining({ fullName: [this.userPage.username] })] }],
      });
      expect(second).toMatchObject({ running: ['false'], participantCount: ['0'], hasUserJoined: ['false'] });
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  // Creates a room through the create API (isBreakout=true) under `parentMeetingID`
  private static async createApiRoom(request: APIRequestContext, roomID: string, parentMeetingID: string) {
    const { response } = await requestApiCall(
      request,
      getApiCallUrl('create', {
        name: roomID,
        meetingID: roomID,
        // the room does not take the parent's join passwords
        attendeePW: parameters.attendeePW,
        moderatorPW: parameters.moderatorPW,
        isBreakout: 'true',
        parentMeetingID,
        sequence: '1',
      }),
    );
    expect(response.returncode, `should create the breakout room ${roomID}`).toEqual(['SUCCESS']);
  }

  private static async wait(ms: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private static async getMeetingInfoXml(request: APIRequestContext, meetingID: string) {
    return (await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }))).response;
  }

  private static async expectMeetingEnded(request: APIRequestContext, meetingID: string, message: string) {
    await expect
      .poll(async () => (await APIBreakout.getMeetingInfoXml(request, meetingID)).messageKey, {
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
        message,
      })
      .toEqual(['notFound']);
  }

  // A room created through the create API (isBreakout=true) ends with its parent, as the
  // rooms created from the breakout panel do
  async testApiCreatedRoomEndsWithParent(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo });
    const roomID = `api-room-${getRandomInt(1000, 9999)}`;
    try {
      await APIBreakout.createApiRoom(request, roomID, this.modPage.meetingId);
      await this.initModPage2(this.modPage.context, { testInfo, meetingId: roomID, fullName: 'RoomModerator' });
      await this.modPage2.hasElement(e.presentationTitle, 'should load the room for its moderator');

      await endMeetings(request, [this.modPage.meetingId]);
      await this.modPage.hasElement(e.meetingEndedModal, 'should end the parent', ELEMENT_WAIT_EXTRA_LONG_TIME);
      await APIBreakout.expectMeetingEnded(
        request,
        roomID,
        'getMeetingInfo should no longer find the room once its parent ended',
      );
      await this.modPage2.hasElement(e.meetingEndedModal, 'should show the meeting ended screen in the room');
    } finally {
      await endMeetings(request, [roomID]);
    }
  }

  // The create API accepts a breakout room as the parent of another one: ending the top
  // meeting ends both levels
  static async testNestedApiCreatedRoomsEndWithParent(request: APIRequestContext) {
    const parentID = await createMeeting();
    const suffix = getRandomInt(1000, 9999);
    const roomID = `api-room-${suffix}`;
    const nestedRoomID = `api-nested-room-${suffix}`;
    try {
      await APIBreakout.createApiRoom(request, roomID, parentID);
      await APIBreakout.createApiRoom(request, nestedRoomID, roomID);
      // akka-apps creates the meetings asynchronously: an end that arrives first is lost
      await APIBreakout.wait(ELEMENT_WAIT_TIME);

      await endMeetings(request, [parentID]);
      await APIBreakout.expectMeetingEnded(request, roomID, 'should end the room of the ended meeting');
      await APIBreakout.expectMeetingEnded(request, nestedRoomID, 'should end the room created inside that room');
    } finally {
      await endMeetings(request, [parentID, roomID, nestedRoomID]);
    }
  }

  // The ID of a room that ended can be reused by a room of another meeting; ending the first
  // meeting must not end the new room
  static async testReusedRoomIdNotEndedByFormerParent(request: APIRequestContext) {
    const formerParentID = await createMeeting();
    const parentID = await createMeeting();
    const roomID = `api-room-${getRandomInt(1000, 9999)}`;
    try {
      await APIBreakout.createApiRoom(request, roomID, formerParentID);
      await endMeetings(request, [roomID]);
      await APIBreakout.expectMeetingEnded(request, roomID, 'should end the room');
      // akka-apps releases the ID of an ended meeting a few seconds after its end
      await APIBreakout.wait(ELEMENT_WAIT_TIME);
      await APIBreakout.createApiRoom(request, roomID, parentID);
      const { internalMeetingID: parentInternalID } = await APIBreakout.getMeetingInfoXml(request, parentID);

      await endMeetings(request, [formerParentID]);
      await APIBreakout.expectMeetingEnded(request, formerParentID, 'should end the former parent');
      // the end of the former parent reaches its rooms within a few seconds
      await APIBreakout.wait(ELEMENT_WAIT_TIME);
      expect(await APIBreakout.getMeetingInfoXml(request, roomID), 'the new room should keep running').toMatchObject({
        returncode: ['SUCCESS'],
        parentMeetingID: parentInternalID,
      });
    } finally {
      await endMeetings(request, [formerParentID, parentID, roomID]);
    }
  }

  // A room whose users all left is still running: ending its parent ends it too
  async testEmptiedApiCreatedRoomEndsWithParent(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const parentID = await createMeeting();
    const roomID = `api-room-${getRandomInt(1000, 9999)}`;
    try {
      await APIBreakout.createApiRoom(request, roomID, parentID);
      await this.initModPage(page, { testInfo, meetingId: roomID, fullName: 'RoomModerator' });
      await this.modPage.hasElement(e.presentationTitle, 'should load the room for its moderator');
      await this.modPage.page.close();
      await expect
        .poll(async () => (await APIBreakout.getMeetingInfoXml(request, roomID)).participantCount, {
          timeout: ELEMENT_WAIT_EXTRA_LONG_TIME * 2,
          message: 'the room should have no participant once its moderator left',
        })
        .toEqual(['0']);

      await endMeetings(request, [parentID]);
      await APIBreakout.expectMeetingEnded(request, roomID, 'should end the emptied room with its parent');
    } finally {
      await endMeetings(request, [parentID, roomID]);
    }
  }

  // A parent that ends on its own takes its API-created rooms with it: nobody joins the parent
  // (a user in the room does not count for it), so it expires after a minute
  async testApiCreatedRoomEndsWhenParentExpires(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const parentID = await createMeeting('meetingExpireIfNoUserJoinedInMinutes=1');
    const roomID = `api-room-${getRandomInt(1000, 9999)}`;
    try {
      await APIBreakout.createApiRoom(request, roomID, parentID);
      await this.initModPage(page, { testInfo, meetingId: roomID, fullName: 'RoomModerator' });
      await this.modPage.hasElement(e.presentationTitle, 'should load the room for its moderator');

      await expect
        .poll(async () => (await APIBreakout.getMeetingInfoXml(request, parentID)).messageKey, {
          timeout: PARENT_EXPIRY_TIMEOUT,
          intervals: [5000],
          message: 'the parent nobody joined should expire',
        })
        .toEqual(['notFound']);
      await APIBreakout.expectMeetingEnded(request, roomID, 'should end the room with its expired parent');
      await this.modPage.hasElement(e.meetingEndedModal, 'should show the meeting ended screen in the room');
    } finally {
      await endMeetings(request, [parentID, roomID]);
    }
  }

  async endParentMeeting(request: APIRequestContext) {
    if (this?.modPage?.meetingId) await endMeetings(request, [this.modPage.meetingId]);
  }

  // The parent's internal meeting ID, which its rooms report as parentMeetingID
  private async getParentInternalId(request: APIRequestContext): Promise<string> {
    const parent = await getMeetingInfoXml(request, this.modPage.meetingId);
    expect(parent.returncode, 'should find the parent meeting').toEqual(['SUCCESS']);
    return parent.internalMeetingID?.[0] as string;
  }

  // Waits until bbb-web lists `count` rooms for the parent and returns their getMeetingInfo, by sequence
  private async waitForListedRooms(request: APIRequestContext, count: number): Promise<XmlElement[]> {
    await expect
      .poll(async () => (await listedBreakoutRoomIds(request, this.modPage.meetingId)).length, {
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
        message: `the parent meeting should list ${count} breakout rooms`,
      })
      .toBe(count);
    const ids = await listedBreakoutRoomIds(request, this.modPage.meetingId);
    const rooms = await Promise.all(ids.map((id) => getMeetingInfoXml(request, id)));
    return rooms.sort((a, b) => Number(a.sequence?.[0]) - Number(b.sequence?.[0]));
  }

  // The counterpart of expectNoRooms: after the same sync akka-apps holds the rooms, and
  // bbb-web lists them once it has created them
  private async expectRoomsCreated(request: APIRequestContext, count: number): Promise<XmlElement[]> {
    await waitForServerToCatchUp(this.modPage);
    expect(await readBreakoutRooms(this.modPage), 'the server should hold the breakout rooms').toHaveLength(count);
    return this.waitForListedRooms(request, count);
  }

  // A room's voice bridge is the parent's plus its sequence (BreakoutApp2x.createVoiceConfId).
  // When another running meeting already holds that number, the room is still expected to
  // exist and be joinable.
  async testVoiceBridgeTakenByAnotherMeeting(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const parentVoiceBridge = getRandomInt(10000, 100000).toString();
    const otherMeetingID = `voice-bridge-taken-${getRandomInt(1000000, 10000000)}`;
    try {
      const other = await requestApiCall(
        request,
        getApiCallUrl('create', {
          name: otherMeetingID,
          meetingID: otherMeetingID,
          voiceBridge: `${parentVoiceBridge}1`,
        }),
      );
      expect(other.response.returncode, "should create the meeting that holds the first room's voice bridge").toEqual([
        'SUCCESS',
      ]);

      await this.initModPage(page, { testInfo, createParameter: `voiceBridge=${parentVoiceBridge}` });
      await this.initUserPage(this.modPage.context, { testInfo });
      await this.createRoomsWith([this.userPage]);

      await expect
        .poll(async () => (await readBreakoutRooms(this.modPage)).length, {
          ...pollOptions,
          message: 'the moderator should see the two rooms',
        })
        .toBe(2);
      const rooms = await this.waitForListedRooms(request, 2);
      expect(
        rooms.map((room) => room.returncode?.[0]),
        'getMeetingInfo should find every room the parent lists',
      ).toEqual(['SUCCESS', 'SUCCESS']);
      const firstRoom = (await readBreakoutRooms(this.modPage)).find((room) => room.sequence === 1);
      expect(
        (await getMeetingInfoXml(request, firstRoom!.breakoutRoomMeetingId)).returncode,
        'getMeetingInfo should find the first room',
      ).toEqual(['SUCCESS']);

      await this.userPage.hasElement(e.modalConfirmButton, 'should invite the attendee to the first room');
      const roomTab = await this.userPage.handleNewTab(e.modalConfirmButton, this.userPage.page.context());
      const roomPage = new Page(this.browser, roomTab, testInfo);
      await roomPage.hasElement(e.presentationTitle, 'should load the first room', ELEMENT_WAIT_EXTRA_LONG_TIME);
    } finally {
      await endMeetings(request, [otherMeetingID]);
    }
  }

  // Creates a breakout room of the moderator's meeting through the API, as an integrator
  // would: the request's meetingID becomes the room's internal ID and bbb-web builds its
  // external ID from the parent (ParamsProcessorUtil.processCreateParams).
  private async createRoomThroughApi(request: APIRequestContext) {
    const requestedID = `api-room-${getRandomInt(1000000, 10000000)}`;
    const { response } = await requestApiCall(
      request,
      getApiCallUrl('create', {
        name: 'ApiRoom',
        meetingID: requestedID,
        // the suite's join passwords: the room does not take the parent's
        attendeePW: parameters.attendeePW,
        moderatorPW: parameters.moderatorPW,
        isBreakout: 'true',
        parentMeetingID: this.modPage.meetingId,
        sequence: '1',
      }),
    );
    expect(response.returncode, 'should create the breakout room').toEqual(['SUCCESS']);
    return { requestedID, response };
  }

  // Joins a moderator to an API-created room, which the client loads as any other meeting
  private async joinApiRoom(roomID: string, testInfo: TestInfo) {
    await this.initModPage2(this.modPage.context, { testInfo, meetingId: roomID, fullName: 'RoomModerator' });
    await this.modPage2.hasElement(e.presentationTitle, 'should load the room for its moderator');
  }

  // A room created through the API with isBreakout=true is a breakout of the given parent
  // and takes nothing else from it.
  async testApiCreatedRoom(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo, createParameter: 'meta_foo=bar' });
    const { requestedID, response } = await this.createRoomThroughApi(request);
    try {
      const parentInternalId = await this.getParentInternalId(request);
      expect(response.meetingID?.[0], 'should give the room an ID of its own').not.toEqual(requestedID);
      expect(response.internalMeetingID, 'should keep the requested ID as the internal one').toEqual([requestedID]);
      expect(response.parentMeetingID, 'should return the parent internal ID').toEqual([parentInternalId]);
      expect(await listedBreakoutRoomIds(request, this.modPage.meetingId), 'the parent should list the room').toEqual(
        response.meetingID,
      );

      const parent = await getMeetingInfoXml(request, this.modPage.meetingId);
      expect(metadataOf(parent).foo, 'control: the parent should carry its metadata').toEqual(['bar']);
      const room = await getMeetingInfoXml(request, requestedID);
      expect(room, 'the room should be a breakout of the parent').toMatchObject({
        returncode: ['SUCCESS'],
        meetingName: ['ApiRoom'],
        isBreakout: ['true'],
        parentMeetingID: [parentInternalId],
        sequence: ['1'],
      });
      expect(metadataOf(room).foo, "the room should not take the parent's metadata").toBeUndefined();

      await this.joinApiRoom(requestedID, testInfo);
      await expect
        .poll(async () => (await getMeetingInfoXml(request, requestedID)).participantCount, {
          ...pollOptions,
          message: 'the room should count its moderator',
        })
        .toEqual(['1']);
    } finally {
      await endMeetings(request, [requestedID]);
    }
  }

  // The ID create returns for an API-created room, which is also the one its parent lists,
  // finds the room
  async testApiCreatedRoomFoundByReturnedId(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo });
    const { requestedID, response } = await this.createRoomThroughApi(request);
    try {
      expect(
        (await getMeetingInfoXml(request, requestedID)).returncode,
        'control: getMeetingInfo should find the room by its internal ID',
      ).toEqual(['SUCCESS']);
      const returnedID = response.meetingID?.[0] as string;
      expect(
        await listedBreakoutRoomIds(request, this.modPage.meetingId),
        'the parent should list the ID create returned',
      ).toEqual([returnedID]);
      expect(
        (await getMeetingInfoXml(request, returnedID)).returncode,
        'getMeetingInfo should find the room by the meetingID create returned',
      ).toEqual(['SUCCESS']);
    } finally {
      await endMeetings(request, [requestedID]);
    }
  }

  // Creates the parent with `createParameter` (record=true and a breakoutRoomsRecord value),
  // joins the attendee, sends a direct BreakoutRoomCreate asking to record two rooms (the
  // attendee in the first) and returns the recording flag getMeetingInfo reports per room
  private async createRoomsAskingToRecord(
    page: PlaywrightPage,
    testInfo: TestInfo,
    request: APIRequestContext,
    createParameter: string,
  ): Promise<string[]> {
    await this.initModPage(page, { testInfo, createParameter });
    await this.initUserPage(this.modPage.context, { testInfo });
    const attendeeId = await getOwnUserId(this.userPage);
    await sendBreakoutRoomCreate(
      this.modPage,
      breakoutRoomCreateVariables(2, { record: true, firstRoomUsers: [attendeeId] }),
    );
    const rooms = await this.waitForListedRooms(request, 2);
    return rooms.map((room) => room.recording?.[0] as string);
  }

  // breakoutRoomsRecord=false: rooms do not record even when the request asks them to
  async testRoomsNotRecordedWhenParentForbids(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const createParameter = 'record=true&breakoutRoomsRecord=false';
    const recording = await this.createRoomsAskingToRecord(page, testInfo, request, createParameter);
    expect(recording, 'breakoutRoomsRecord=false should keep the rooms from recording').toEqual(['false', 'false']);
  }

  // Positive control: breakoutRoomsRecord=true lets the same request record the rooms
  async testRoomsRecordedWhenParentAllows(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const createParameter = 'record=true&breakoutRoomsRecord=true';
    const recording = await this.createRoomsAskingToRecord(page, testInfo, request, createParameter);
    expect(recording, 'breakoutRoomsRecord=true should let the rooms record').toEqual(['true', 'true']);
  }

  // disabledFeatures=breakoutRooms: a BreakoutRoomCreate sent directly creates no room,
  // and the moderator is not ejected for it (apps.ejectOnViolation=false by default)
  async testDisabledBreakoutRoomsNotCreated(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo, createParameter: 'disabledFeatures=breakoutRooms' });
    await sendBreakoutRoomCreate(this.modPage, breakoutRoomCreateVariables(2));
    await expectNoRooms(this.modPage, this.modPage.meetingId, request, 'with breakoutRooms disabled');
    await expect(
      this.modPage.page.locator(e.meetingEndedModal),
      'the moderator should stay in the meeting',
    ).toBeHidden();
    await this.modPage.hasElement(e.presentationTitle, 'the moderator should still see the meeting');
  }

  // Positive control: the same request in a meeting with breakout rooms enabled creates them
  async testBreakoutRoomCreateTakesEffect(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo });
    await sendBreakoutRoomCreate(this.modPage, breakoutRoomCreateVariables(2));
    const rooms = await this.expectRoomsCreated(request, 2);
    expect(
      rooms.map((room) => room.sequence?.[0]),
      'the request should create both rooms',
    ).toEqual(['1', '2']);
  }

  // Only a moderator may create rooms: an attendee's request is refused by the actions
  // server (throwErrorIfNotModerator) and creates nothing; the moderator's same request
  // creates them
  async testAttendeeCannotCreateRooms(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initPages(page, testInfo);
    const attendeeId = await getOwnUserId(this.userPage);
    const variables = breakoutRoomCreateVariables(2, { firstRoomUsers: [attendeeId] });
    const refused = await graphql(this.userPage, BREAKOUT_ROOM_CREATE, variables);
    expect(refused.errors, "the attendee's request should be refused").toBeDefined();
    await expectNoRooms(this.modPage, this.modPage.meetingId, request, "after the attendee's request");
    await this.userPage.hasElement(e.presentationTitle, 'the attendee should stay in the meeting');

    await sendBreakoutRoomCreate(this.modPage, variables);
    await this.expectRoomsCreated(request, 2);
  }

  // A breakout room cannot have rooms of its own: the moderator's request sent from inside
  // room 1 creates nothing there, and the moderator stays in the room
  async testRoomCannotCreateRooms(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo });
    // control: the request creates the rooms of the parent
    await sendBreakoutRoomCreate(this.modPage, breakoutRoomCreateVariables(2));
    const [firstRoom] = await this.expectRoomsCreated(request, 2);
    const firstRoomId = firstRoom.meetingID?.[0] as string;

    // rooms created outside the panel leave it closed
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.hasElement(e.roomOptions1, 'should list the first room in the breakout panel');
    const roomTab = await this.joinFirstBreakoutRoomAsModerator();
    const roomPage = new Page(this.browser, roomTab, this.modPage.testInfo);
    await sendBreakoutRoomCreate(roomPage, breakoutRoomCreateVariables(2));
    await expectNoRooms(roomPage, firstRoomId, request, 'inside the first room');
    await expect(roomTab.locator(e.meetingEndedModal), 'the moderator should stay in the room').toBeHidden();
    await roomPage.hasElement(e.presentationTitle, 'the moderator should still see the room');
  }

  // The server drops a request for more rooms than public.app.breakouts.breakoutRoomLimit
  // (16) or fewer than breakoutRoomMinimum (2), and accepts two rooms
  async testRoomCountLimits(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo });
    await sendBreakoutRoomCreate(this.modPage, breakoutRoomCreateVariables(17));
    await expectNoRooms(this.modPage, this.modPage.meetingId, request, 'with 17 rooms requested');
    await sendBreakoutRoomCreate(this.modPage, breakoutRoomCreateVariables(1));
    await expectNoRooms(this.modPage, this.modPage.meetingId, request, 'with 1 room requested');

    await sendBreakoutRoomCreate(this.modPage, breakoutRoomCreateVariables(2));
    const rooms = await this.expectRoomsCreated(request, 2);
    expect(
      rooms.map((room) => room.sequence?.[0]),
      'two rooms should be created',
    ).toEqual(['1', '2']);
  }

  // Ending the parent through the API ends the rooms created from the panel
  async testEndingParentEndsRooms(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initPages(page, testInfo);
    await this.create();
    const [firstRoom] = await this.waitForListedRooms(request, 2);
    const firstRoomId = firstRoom.meetingID?.[0] as string;
    const roomPage = await this.joinRoom();
    // bbb-web counts the attendee once it has handled the user-joined event, a moment after the room loaded
    await expect
      .poll(async () => (await getMeetingInfoXml(request, firstRoomId)).running, {
        ...pollOptions,
        message: 'control: the first room should run with the attendee in it',
      })
      .toEqual(['true']);

    await endMeetings(request, [this.modPage.meetingId]);
    await roomPage.hasElement(
      e.meetingEndedModal,
      'should show the meeting ended screen in the room',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await expect
      .poll(async () => (await getMeetingInfoXml(request, firstRoomId)).messageKey, {
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
        message: 'getMeetingInfo should no longer find the room',
      })
      .toEqual(['notFound']);
  }

  // getMeetings lists the parent with its rooms, and each room as a breakout of the parent
  async testGetMeetingsListsRooms(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initPages(page, testInfo);
    await this.create();
    const parentInternalId = await this.getParentInternalId(request);
    const roomIds = (await this.waitForListedRooms(request, 2)).map((room) => room.meetingID?.[0]);

    const meetings = await getMeetingsXml(request);
    const parent = meetings.find((meeting) => meeting.meetingID?.[0] === this.modPage.meetingId);
    expect(parent, 'getMeetings should list the parent').toBeDefined();
    expect(parent!.isBreakout, 'the parent should not be a breakout').toEqual(['false']);
    expect(breakoutRoomIdsOf(parent!).sort(), 'the parent entry should list its two rooms').toEqual(
      [...roomIds].sort(),
    );
    const rooms = meetings.filter((meeting) => meeting.parentMeetingID?.[0] === parentInternalId);
    expect(rooms.map((room) => room.meetingID?.[0]).sort(), 'getMeetings should list both rooms of the parent').toEqual(
      [...roomIds].sort(),
    );
    rooms.forEach((room) => {
      expect(room, 'each room should be a breakout of the parent').toMatchObject({
        isBreakout: ['true'],
        parentMeetingID: [parentInternalId],
      });
    });
    expect(rooms.map((room) => room.sequence?.[0]).sort(), 'the rooms should carry their sequence').toEqual(['1', '2']);
  }
}
