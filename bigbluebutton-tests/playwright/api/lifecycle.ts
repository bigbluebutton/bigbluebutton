import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import {
  createMeeting,
  endMeetings,
  getApiCallUrl,
  getRandomInt,
  requestApiCall,
  type XmlElement,
} from '../core/helpers';
import { MultiUsers } from '../user/multiusers';

const pollOptions = { timeout: ELEMENT_WAIT_LONGER_TIME };

async function isMeetingRunning(request: APIRequestContext, meetingID: string): Promise<string | XmlElement> {
  const { response } = await requestApiCall(request, getApiCallUrl('isMeetingRunning', { meetingID }));
  expect(response.returncode, 'isMeetingRunning should succeed').toEqual(['SUCCESS']);
  return response.running?.[0] ?? '';
}

async function getMeetingInfo(request: APIRequestContext, meetingID: string): Promise<XmlElement> {
  return (await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }))).response;
}

// The <meeting> entry getMeetings returns for this meeting, if any
async function findInGetMeetings(request: APIRequestContext, meetingID: string): Promise<XmlElement | undefined> {
  const { response } = await requestApiCall(request, getApiCallUrl('getMeetings', null));
  expect(response.returncode, 'getMeetings should succeed').toEqual(['SUCCESS']);
  const meetings = ((response.meetings?.[0] as XmlElement | undefined)?.meeting ?? []) as XmlElement[];
  return meetings.find((meeting) => meeting.meetingID?.[0] === meetingID);
}

const meetingParams = (meetingID: string) => ({ name: meetingID, meetingID, attendeePW: 'ap', moderatorPW: 'mp' });

export class APILifecycle extends MultiUsers {
  // Follows one meeting from create to end through isMeetingRunning,
  // getMeetingInfo and getMeetings, with end called first with a wrong ID.
  async testLifecycle(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const meetingID = await createMeeting();
    try {
      expect(await isMeetingRunning(request, meetingID), 'should not run before the first join').toBe('false');
      const created = await getMeetingInfo(request, meetingID);
      expect(created).toMatchObject({
        returncode: ['SUCCESS'],
        meetingName: [meetingID],
        meetingID: [meetingID],
        running: ['false'],
        hasUserJoined: ['false'],
        hasBeenForciblyEnded: ['false'],
        participantCount: ['0'],
        moderatorCount: ['0'],
        isBreakout: ['false'],
      });
      expect(created.internalMeetingID?.[0], 'should return the internal meeting ID').toMatch(/^[0-9a-f]{40}-\d+$/);
      expect(created.createTime?.[0], 'should return the create time').toMatch(/^\d+$/);
      expect(await findInGetMeetings(request, meetingID), 'getMeetings should list the meeting').toMatchObject({
        internalMeetingID: created.internalMeetingID,
        running: ['false'],
      });

      // The join goes through the deprecated password parameter (moderatorPW).
      await this.initModPage(page, { testInfo, meetingId: meetingID });
      await expect
        .poll(() => isMeetingRunning(request, meetingID), { ...pollOptions, message: 'should run after the join' })
        .toBe('true');
      const moderator = expect.objectContaining({
        fullName: [this.modPage.username],
        role: ['MODERATOR'],
        isPresenter: ['true'],
      });
      expect(await getMeetingInfo(request, meetingID)).toMatchObject({
        running: ['true'],
        hasUserJoined: ['true'],
        participantCount: ['1'],
        moderatorCount: ['1'],
        attendees: [{ attendee: [moderator] }],
      });
      expect(await findInGetMeetings(request, meetingID), 'getMeetings should list the running meeting').toMatchObject({
        running: ['true'],
        participantCount: ['1'],
        attendees: [{ attendee: [moderator] }],
      });

      const wrongEnd = await requestApiCall(request, getApiCallUrl('end', { meetingID: `${meetingID}-unknown` }));
      expect(wrongEnd.response, 'end with an unknown meeting ID should fail').toMatchObject({
        returncode: ['FAILED'],
        messageKey: ['notFound'],
      });
      expect(await isMeetingRunning(request, meetingID), 'a refused end should leave the meeting running').toBe('true');

      const end = await requestApiCall(request, getApiCallUrl('end', { meetingID }));
      expect(end.response).toMatchObject({ returncode: ['SUCCESS'], messageKey: ['sentEndMeetingRequest'] });
      await this.modPage.hasElement(e.meetingEndedModal, 'should show the meeting ended screen to the moderator');
      await expect
        .poll(() => isMeetingRunning(request, meetingID), { ...pollOptions, message: 'should stop running after end' })
        .toBe('false');
      await expect
        .poll(async () => (await getMeetingInfo(request, meetingID)).messageKey, {
          ...pollOptions,
          message: 'getMeetingInfo should no longer find the meeting',
        })
        .toEqual(['notFound']);
      expect(
        await findInGetMeetings(request, meetingID),
        'getMeetings should no longer list the meeting',
      ).toBeUndefined();

      const join = await requestApiCall(
        request,
        getApiCallUrl('join', { fullName: 'Late', meetingID, role: 'VIEWER' }),
      );
      expect(join.location, 'a join after end should not open a session').not.toContain('sessionToken');
      expect(join.redirectErrors?.length, 'a join after end should be refused with an error').toBeGreaterThan(0);
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // Repeating create returns the running meeting as long as the passwords
  // match; after end the same ID creates a new meeting.
  static async testCreateTwice(request: APIRequestContext) {
    const meetingID = `create-twice-${getRandomInt(1000000, 10000000)}`;
    const create = async (params: Record<string, string>) =>
      (await requestApiCall(request, getApiCallUrl('create', params))).response;
    try {
      const first = await create(meetingParams(meetingID));
      expect(first.returncode).toEqual(['SUCCESS']);

      const same = await create(meetingParams(meetingID));
      expect(same, 'the same create again should return the running meeting').toMatchObject({
        returncode: ['SUCCESS'],
        messageKey: ['duplicateWarning'],
        internalMeetingID: first.internalMeetingID,
      });

      const renamed = await create({ ...meetingParams(meetingID), name: `${meetingID}-renamed` });
      expect(renamed, 'a create with another name should return the running meeting').toMatchObject({
        returncode: ['SUCCESS'],
        messageKey: ['duplicateWarning'],
        internalMeetingID: first.internalMeetingID,
      });

      const otherPasswords = await create({ ...meetingParams(meetingID), attendeePW: 'ap2', moderatorPW: 'mp2' });
      expect(otherPasswords, 'a create with other passwords should be refused').toMatchObject({
        returncode: ['FAILED'],
        messageKey: ['idNotUnique'],
      });

      await endMeetings(request, [meetingID]);
      await expect
        .poll(async () => (await getMeetingInfo(request, meetingID)).messageKey, pollOptions)
        .toEqual(['notFound']);
      const again = await create(meetingParams(meetingID));
      expect(again.returncode, 'after end the meeting ID should create a new meeting').toEqual(['SUCCESS']);
      expect(again.messageKey).not.toEqual(['duplicateWarning']);
      expect(again.internalMeetingID).not.toEqual(first.internalMeetingID);
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }
}
