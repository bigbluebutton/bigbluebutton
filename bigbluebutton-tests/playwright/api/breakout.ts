import { expect } from '@playwright/test';

import { Join } from '../breakout/join';
import { getMeetingInfo } from '../core/endpoints';
import { createMeetingPromise } from '../core/helpers';

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
  async testBreakoutWithoutSequenceNumber() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await expect(
      createMeetingPromise(`isBreakout=true&parentMeetingID=${this.modPage.meetingId}`),
    ).rejects.toMatchObject({
      response: { status: 500 },
    });
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
  async testBreakoutMeetingInfoNoJoins() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    // We have two breakout rooms, but neither user has joined a breakout room.
    // Make sure the API getMeetingInfo returns expected results

    const { data } = await getMeetingInfo(this.modPage.meetingId);
    expect(data.response.returncode).toEqual(['SUCCESS']);
    expect(data.response.isBreakout).toEqual(['false']);
    expect(data.response?.breakoutRooms?.[0]?.breakout?.length).toEqual(2);

    const breakoutRoomResponses = await Promise.all(
      (data.response.breakoutRooms?.[0]?.breakout || []).map(async (breakoutRoom: { length: string[] }) => {
        const { data } = await getMeetingInfo(breakoutRoom.length[0]);
        return { breakoutRoom: breakoutRoom.length, data };
      }),
    );

    breakoutRoomResponses.forEach(({ breakoutRoom, data }) => {
      const expectedMeeting = {
        meetingID: [breakoutRoom],
        isBreakout: ['true'],
        running: ['false'],
        participantCount: ['0'],
        hasUserJoined: ['false'],
        attendees: ['\n'] /* no attendees; the newline is an artifact of xml2js */,
        freeJoin: ['false'],
        sequence: [expect.stringMatching('[12]')],
        parentMeetingID: data.response.internalMeetingID,
      };

      expect(data.response.returncode).toEqual('FAILED');
      expect(data.response).toMatchObject(expectedMeeting);
    });
  }

  async testBreakoutMeetingInfoOneJoin() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    // We have two breakout rooms, and one user has joined a breakout room.
    // Make sure the API getMeetingInfo returns expected results

    // First, check that we can retrieve the parent meeting

    const { data } = await getMeetingInfo(this.modPage.meetingId);
    expect(data.response.returncode).toEqual('SUCCESS');
    expect(data.response.isBreakout).toEqual('FALSE');

    // Then, check that the parent meeting lists two breakout rooms
    const breakoutRooms = data.response?.breakoutRooms?.[0]?.breakout;
    if (!breakoutRooms) throw new Error('no breakout rooms found');
    expect(breakoutRooms.length).toEqual(2);

    // Retrieve meeting info for both breakout rooms

    // Attendee, a VIEWER in the parent meeting, becomes a MODERATOR (and presenter) in breakout

    const expectedUser = expect.objectContaining({
      fullName: ['Attendee'],
      role: ['MODERATOR'],
      isPresenter: ['true'],
    });

    const expectedMeeting1 = {
      isBreakout: ['true'],
      running: ['true'],
      participantCount: ['1'],
      hasUserJoined: ['true'],
      attendees: [{ attendee: [expectedUser] }],
      freeJoin: ['false'],
      sequence: ['1'],
      parentMeetingID: data.response.internalMeetingID,
    };

    const expectedMeeting2 = {
      isBreakout: ['true'],
      running: ['false'],
      participantCount: ['0'],
      hasUserJoined: ['false'],
      attendees: ['\n'] /* no attendees; the newline is an artifact of xml2js */,
      freeJoin: ['false'],
      sequence: ['2'],
      parentMeetingID: data.response.internalMeetingID,
    };

    const expectedResponse1 = { response: expect.objectContaining(expectedMeeting1) };
    const expectedResponse2 = { response: expect.objectContaining(expectedMeeting2) };

    // Note that this is an array of two responses from two API calls,
    // not a single API call response containing two breakout rooms

    const response2array = breakoutRooms.map((breakoutRoom) => getMeetingInfo(breakoutRoom.length[0]));
    expect(response2array).toEqual(expect.arrayContaining([expectedResponse1, expectedResponse2]));
  }
}
