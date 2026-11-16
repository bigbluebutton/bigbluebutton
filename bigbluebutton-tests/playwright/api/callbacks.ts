import { type APIRequestContext, expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { createMeeting, endMeetings, getApiCallUrl, getChecksum, getRandomInt, requestApiCall } from '../core/helpers';
import { parameters } from '../core/parameters';

// bbb-web appends recordingmarks and meetingID to the meeting-ended callback URL. The suite has
// no callback receiver, so the callback is bbb-web's own create, signed for the query bbb-web
// reads once both parameters are appended after the checksum: only a callback that carries
// "recordingmarks=false&meetingID=<id>" passes the checksum, and a passing create re-creates the
// meeting that just ended, which getMeetingInfo then reports under a new internal meeting ID.
function selfCreateCallbackUrl(meetingID: string): string {
  const name = `callback-${meetingID}`;
  const query = new URLSearchParams({ name, recordingmarks: 'false', meetingID }).toString();
  const checksum = getChecksum(`create${query}${parameters.secret}`, parameters.secret!);
  return `${parameters.server}/api/create?name=${encodeURIComponent(name)}&checksum=${checksum}`;
}

async function internalMeetingID(request: APIRequestContext, meetingID: string): Promise<string | undefined> {
  const { response } = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }));
  return response.returncode?.[0] === 'SUCCESS' ? (response.internalMeetingID?.[0] as string) : undefined;
}

// Creates the meeting with the callback set by `createParameter`, ends it and returns the
// internal meeting ID it had.
async function createAndEnd(request: APIRequestContext, createParameter: string, meetingID: string): Promise<string> {
  expect(await createMeeting(createParameter, meetingID)).toBe(meetingID);
  const ended = await internalMeetingID(request, meetingID);
  expect(ended, 'the meeting should exist before it is ended').toBeDefined();
  const end = await requestApiCall(request, getApiCallUrl('end', { meetingID }));
  expect(end.response.returncode).toEqual(['SUCCESS']);
  return ended!;
}

// Resolves once getMeetingInfo reports the meeting under another internal ID than the one it
// had when it was ended, which only the callback's create can cause.
function waitForRecreation(request: APIRequestContext, meetingID: string, ended: string, message?: string) {
  return expect
    .poll(
      async () => {
        const current = await internalMeetingID(request, meetingID);
        return current !== undefined && current !== ended;
      },
      { timeout: ELEMENT_WAIT_LONGER_TIME, message },
    )
    .toBe(true);
}

export class APICallbacks {
  // meta_endCallbackUrl has carried both parameters since 2.2, so it tells whether this server
  // accepts a callback to its own host at all (fetchUrlAllowedLocalHosts).
  static async serverCallsBackItsOwnHost(request: APIRequestContext): Promise<boolean> {
    const meetingID = `callback-control-${getRandomInt(1000000, 10000000)}`;
    try {
      const callback = `meta_endCallbackUrl=${encodeURIComponent(selfCreateCallbackUrl(meetingID))}`;
      const ended = await createAndEnd(request, callback, meetingID);
      return await waitForRecreation(request, meetingID, ended).then(
        () => true,
        () => false,
      );
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  static async testMeetingEndedUrlCarriesRecordingmarksAndMeetingID(request: APIRequestContext) {
    const meetingID = `callback-ended-${getRandomInt(1000000, 10000000)}`;
    try {
      const callback = `meetingEndedURL=${encodeURIComponent(selfCreateCallbackUrl(meetingID))}`;
      const ended = await createAndEnd(request, callback, meetingID);
      await waitForRecreation(
        request,
        meetingID,
        ended,
        'the meetingEndedURL callback should carry recordingmarks=false and meetingID',
      );
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }
}
