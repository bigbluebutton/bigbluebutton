import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { createMeeting, endMeetings, getApiCallUrl, getChecksum, getRandomInt, requestApiCall } from '../core/helpers';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';

const uniqueMeetingID = (prefix: string) => `${prefix}-${getRandomInt(1000000, 10000000)}`;

async function createWithParams(request: APIRequestContext, params: Record<string, string>) {
  const { response } = await requestApiCall(request, getApiCallUrl('create', params));
  expect(response.returncode, 'create should succeed').toEqual(['SUCCESS']);
}

async function getMeetingInfo(request: APIRequestContext, meetingID: string) {
  const { response } = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }));
  return response;
}

// The guest status a viewer joining with these parameters gets, from the redirect=false answer.
async function guestStatusOnJoin(request: APIRequestContext, meetingID: string, joinParams: Record<string, string>) {
  const { response } = await requestApiCall(
    request,
    getApiCallUrl('join', { fullName: 'Viewer', meetingID, role: 'VIEWER', redirect: 'false', ...joinParams }),
  );
  return response.guestStatus?.[0];
}

export class APIParameters extends MultiUsers {
  // meta_ names are stored lowercased; a name with an underscore after the prefix is dropped.
  static async testMetadataNames(request: APIRequestContext) {
    const meetingID = uniqueMeetingID('metadata-names');
    try {
      await createWithParams(request, {
        name: meetingID,
        meetingID,
        'meta_Mixed-Case': 'mixed',
        meta_plain: 'plain',
        meta_with_underscore: 'underscore',
      });
      const metadata = (await getMeetingInfo(request, meetingID)).metadata?.[0] as Record<string, string[]>;
      expect(metadata['mixed-case'], 'should keep a mixed-case name, lowercased').toEqual(['mixed']);
      expect(metadata.plain, 'should keep a plain name').toEqual(['plain']);
      expect(Object.keys(metadata), 'should drop a name with an underscore after the prefix').not.toContain(
        'with_underscore',
      );
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // ALWAYS_ACCEPT_AUTH sends only guests to the waiting room.
  static async testGuestPolicyAlwaysAcceptAuth(request: APIRequestContext) {
    const meetingID = uniqueMeetingID('guest-policy-auth');
    try {
      await createWithParams(request, { name: meetingID, meetingID, guestPolicy: 'ALWAYS_ACCEPT_AUTH' });
      expect(await guestStatusOnJoin(request, meetingID, { guest: 'true' }), 'should make a guest wait').toBe('WAIT');
      expect(await guestStatusOnJoin(request, meetingID, {}), 'should admit a viewer who is not a guest').toBe('ALLOW');
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // auth= sets whether the user counts as authenticated, which bbb-web otherwise assumes when guest= is absent.
  // ASK_MODERATOR sends authenticated viewers to the waiting room as well as guests.
  static async testJoinAuthUnderAskModerator(request: APIRequestContext) {
    const meetingID = uniqueMeetingID('join-auth');
    try {
      await createWithParams(request, { name: meetingID, meetingID, guestPolicy: 'ASK_MODERATOR' });
      expect(await guestStatusOnJoin(request, meetingID, {}), 'should make a viewer without guest= wait').toBe('WAIT');
      expect(
        await guestStatusOnJoin(request, meetingID, { auth: 'false' }),
        'should admit a viewer with auth=false',
      ).toBe('ALLOW');
      expect(
        await guestStatusOnJoin(request, meetingID, { guest: 'false', auth: 'true' }),
        'should make a viewer with auth=true wait even with guest=false',
      ).toBe('WAIT');
      expect(
        await guestStatusOnJoin(request, meetingID, { guest: 'true', auth: 'false' }),
        'should make a guest wait whatever auth= says',
      ).toBe('WAIT');
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // userdata-<name> reaches getMeetingInfo as the attendee's customdata, under <name>; bbb-web splits the
  // parameter name on '-', so a name that has one more is dropped.
  async testJoinCustomUserdata(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const meetingID = await createMeeting();
    try {
      await this.initModPage(page, {
        testInfo,
        meetingId: meetingID,
        joinParameter: 'userdata-team_color=blue&userdata-favourite-color=green',
      });
      let customdata: Record<string, string[]> = {};
      await expect
        .poll(
          async () => {
            const attendees = (
              (await getMeetingInfo(request, meetingID)).attendees?.[0] as {
                attendee?: { customdata?: Record<string, string[]>[] }[];
              }
            )?.attendee;
            customdata = attendees?.[0]?.customdata?.[0] ?? {};
            return customdata.team_color;
          },
          { timeout: ELEMENT_WAIT_LONGER_TIME, message: 'should list the userdata value in the customdata' },
        )
        .toEqual(['blue']);
      const kept = ['favourite-color', 'favourite', 'color'].filter((name) => name in customdata);
      expect(kept, 'should drop a userdata name with a dash in it').toEqual([]);
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  static async testCreateWithoutNameRefused(request: APIRequestContext) {
    const meetingID = uniqueMeetingID('create-without-name');
    const { response } = await requestApiCall(request, getApiCallUrl('create', { meetingID }));
    expect(response.returncode, 'should refuse a create without name').toEqual(['FAILED']);
    expect(await getMeetingInfo(request, meetingID), 'should not create the meeting').toMatchObject({
      returncode: ['FAILED'],
    });
  }

  static async testRepeatedCreateParameterRefused(request: APIRequestContext) {
    const meetingID = uniqueMeetingID('repeated-parameter');
    // getApiCallUrl takes a map, which cannot repeat a key, so this query is signed by hand
    const query = `name=${meetingID}&meetingID=${meetingID}&maxParticipants=3&maxParticipants=7`;
    const checksum = getChecksum(`create${query}${parameters.secret}`, parameters.secret!);
    try {
      const res = await request.get(`${parameters.server}/api/create?${query}&checksum=${checksum}`);
      expect(res.status(), 'should answer the repeated parameter with HTTP 200').toBe(200);
      expect(await res.text(), 'should refuse the repeated parameter with returncode FAILED').toContain(
        '<returncode>FAILED</returncode>',
      );
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }
}
