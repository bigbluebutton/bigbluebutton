import { type APIRequestContext, expect } from '@playwright/test';

import { Join } from '../breakout/join';
import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { getMeetingInfo } from '../core/endpoints';
import { createMeeting, createMeetingPromise, endMeetings } from '../core/helpers';

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

  async endParentMeeting(request: APIRequestContext) {
    if (this?.modPage?.meetingId) await endMeetings(request, [this.modPage.meetingId]);
  }
}
