import { type APIRequestContext, expect, test } from '@playwright/test';

import {
  type ApiCallResult,
  CHECKSUM_ALGORITHMS,
  endMeetings,
  getApiCallUrl,
  getRandomInt,
  requestApiCall,
} from '../core/helpers';

const CHECKSUM_LENGTH = { sha1: 40, sha256: 64, sha384: 96, sha512: 128 };

const checksumOf = (url: string) => url.match(/checksum=([0-9a-f]+)$/)?.[1] ?? '';

// The ways a caller without the shared secret can get a checksum wrong: tamper
// with a valid one, leave it out, reuse one signed for another call, or add a
// second one next to the valid one.
function refusedUrls(name: string, params: Record<string, string>, otherCall: string) {
  const valid = getApiCallUrl(name, params);
  const checksum = checksumOf(valid);
  const changed = `${checksum.slice(0, -1)}${checksum.endsWith('0') ? '1' : '0'}`;
  return [
    {
      label: 'a checksum with one character changed',
      url: valid.replace(`checksum=${checksum}`, `checksum=${changed}`),
    },
    { label: 'no checksum', url: valid.replace(`&checksum=${checksum}`, '') },
    { label: `a checksum computed for ${otherCall}`, url: getApiCallUrl(name, params, { signedAs: otherCall }) },
    { label: 'a second checksum', url: `${valid}&checksum=${changed}` },
  ];
}

function expectChecksumError({ status, response }: ApiCallResult, label: string) {
  expect(status, `${label}: should answer with an API response`).toBe(200);
  expect(response.returncode, `${label}: should fail`).toEqual(['FAILED']);
  expect(response.messageKey, `${label}: should report checksumError`).toEqual(['checksumError']);
}

const meetingParams = (meetingID: string) => ({ name: meetingID, meetingID, attendeePW: 'ap', moderatorPW: 'mp' });

export class APIChecksum {
  // Every algorithm in the default supportedChecksumAlgorithms signs create,
  // join and a read call.
  static async testAlgorithmsAccepted(request: APIRequestContext) {
    const meetingIDs: string[] = [];
    try {
      for (const algorithm of CHECKSUM_ALGORITHMS) {
        await test.step(algorithm, async () => {
          const meetingID = `checksum-${algorithm}-${getRandomInt(1000000, 10000000)}`;
          const createUrl = getApiCallUrl('create', meetingParams(meetingID), { algorithm });
          expect(checksumOf(createUrl), `the test should sign with ${algorithm}`).toHaveLength(
            CHECKSUM_LENGTH[algorithm],
          );
          const create = await requestApiCall(request, createUrl);
          meetingIDs.push(meetingID);
          expect(create.response.returncode, `create signed with ${algorithm} should succeed`).toEqual(['SUCCESS']);
          expect(create.response.meetingID).toEqual([meetingID]);

          const info = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }, { algorithm }));
          expect(info.response.returncode, `getMeetingInfo signed with ${algorithm} should succeed`).toEqual([
            'SUCCESS',
          ]);
          expect(info.response.meetingID).toEqual([meetingID]);

          const join = await requestApiCall(
            request,
            getApiCallUrl(
              'join',
              { fullName: 'Checksum', meetingID, role: 'VIEWER', redirect: 'false' },
              { algorithm },
            ),
          );
          expect(join.response.returncode, `join signed with ${algorithm} should succeed`).toEqual(['SUCCESS']);
          expect(join.response.messageKey).toEqual(['successfullyJoined']);
        });
      }
    } finally {
      await endMeetings(request, meetingIDs);
    }
  }

  static async testCreateRefused(request: APIRequestContext) {
    const meetingID = `checksum-create-${getRandomInt(1000000, 10000000)}`;
    try {
      for (const { label, url } of refusedUrls('create', meetingParams(meetingID), 'join')) {
        expectChecksumError(await requestApiCall(request, url), `create with ${label}`);
      }
      const info = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }));
      expect(info.response.messageKey, 'the refused create calls should not create the meeting').toEqual(['notFound']);
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  static async testGetMeetingInfoRefused(request: APIRequestContext) {
    const meetingID = `checksum-info-${getRandomInt(1000000, 10000000)}`;
    try {
      const create = await requestApiCall(request, getApiCallUrl('create', meetingParams(meetingID)));
      expect(create.response.returncode).toEqual(['SUCCESS']);
      for (const { label, url } of refusedUrls('getMeetingInfo', { meetingID }, 'isMeetingRunning')) {
        const result = await requestApiCall(request, url);
        expectChecksumError(result, `getMeetingInfo with ${label}`);
        expect(
          result.response.meetingID,
          `getMeetingInfo with ${label}: should not return the meeting`,
        ).toBeUndefined();
      }
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // join answers a checksum error with a redirect carrying the error list, never
  // with the client URL.
  static async testJoinRefused(request: APIRequestContext) {
    const meetingID = `checksum-join-${getRandomInt(1000000, 10000000)}`;
    try {
      const create = await requestApiCall(request, getApiCallUrl('create', meetingParams(meetingID)));
      expect(create.response.returncode).toEqual(['SUCCESS']);
      const joinParams = { fullName: 'Checksum', meetingID, role: 'MODERATOR' };
      for (const { label, url } of refusedUrls('join', joinParams, 'create')) {
        const { status, location, redirectErrors } = await requestApiCall(request, url);
        expect(status, `join with ${label}: should redirect`).toBe(302);
        expect(location, `join with ${label}: should not open a session`).not.toContain('sessionToken');
        expect(
          redirectErrors?.map((error) => error.key),
          `join with ${label}: should report checksumError`,
        ).toEqual(['checksumError']);
      }
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }
}
