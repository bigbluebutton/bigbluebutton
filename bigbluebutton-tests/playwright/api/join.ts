import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { createMeeting, endMeetings, getApiCallUrl, getRandomInt, requestApiCall } from '../core/helpers';
import { MultiUsers } from '../user/multiusers';

const pollOptions = { timeout: ELEMENT_WAIT_LONGER_TIME };

const join = (request: APIRequestContext, params: Record<string, string>) =>
  requestApiCall(request, getApiCallUrl('join', params));

async function createWithParams(request: APIRequestContext, params: Record<string, string>) {
  const { response } = await requestApiCall(request, getApiCallUrl('create', params));
  expect(response.returncode, 'create should succeed').toEqual(['SUCCESS']);
  return response;
}

const isMeetingRunning = async (request: APIRequestContext, meetingID: string) =>
  (await requestApiCall(request, getApiCallUrl('isMeetingRunning', { meetingID }))).response.running?.[0];

export class APIJoin extends MultiUsers {
  // role= sets the role whatever password comes with it (case insensitive):
  // the moderator password with role=VIEWER joins a viewer, the attendee
  // password with role=moderator joins a moderator.
  async testRoleOverridesPassword(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const meetingID = await createMeeting();
    try {
      await this.initModPage(page, {
        testInfo,
        meetingId: meetingID,
        fullName: 'ViewerByRole',
        joinParameter: 'role=VIEWER',
      });
      await this.initUserPage(this.modPage.context, {
        testInfo,
        fullName: 'ModeratorByRole',
        joinParameter: 'role=moderator',
      });
      await expect
        .poll(async () => {
          const { response } = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }));
          const attendees = (response.attendees?.[0] as { attendee?: { fullName: string[]; role: string[] }[] })
            ?.attendee;
          return Object.fromEntries((attendees ?? []).map(({ fullName, role }) => [fullName[0], role[0]]));
        }, pollOptions)
        .toEqual({ ViewerByRole: 'VIEWER', ModeratorByRole: 'MODERATOR' });
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // A join needs a matching password or a role. A meeting created without
  // passwords gets random ones, returned by create.
  static async testPasswordAndRoleRules(request: APIRequestContext) {
    const withPasswords = `join-rules-pw-${getRandomInt(1000000, 10000000)}`;
    const withoutPasswords = `join-rules-nopw-${getRandomInt(1000000, 10000000)}`;
    try {
      await createWithParams(request, {
        name: withPasswords,
        meetingID: withPasswords,
        attendeePW: 'ap',
        moderatorPW: 'mp',
      });
      const generated = await createWithParams(request, { name: withoutPasswords, meetingID: withoutPasswords });
      const generatedPassword = generated.attendeePW?.[0] as string;
      expect(generatedPassword, 'create should return a generated attendee password').toMatch(/^\w+$/);
      const cases: { label: string; meetingID: string; extra: Record<string, string>; joins: boolean }[] = [
        { label: 'a wrong password', meetingID: withPasswords, extra: { password: 'wrong' }, joins: false },
        { label: 'neither password nor role', meetingID: withPasswords, extra: {}, joins: false },
        { label: 'the attendee password', meetingID: withPasswords, extra: { password: 'ap' }, joins: true },
        { label: 'a role and no password', meetingID: withPasswords, extra: { role: 'VIEWER' }, joins: true },
        {
          label: 'the generated attendee password',
          meetingID: withoutPasswords,
          extra: { password: generatedPassword },
          joins: true,
        },
        {
          label: 'a password the meeting was not created with',
          meetingID: withoutPasswords,
          extra: { password: 'ap' },
          joins: false,
        },
        {
          label: 'a role to a meeting created without passwords',
          meetingID: withoutPasswords,
          extra: { role: 'viewer' },
          joins: true,
        },
      ];
      for (const { label, meetingID, extra, joins } of cases) {
        const { status, response } = await join(request, { fullName: 'Rules', meetingID, redirect: 'false', ...extra });
        expect(status, `join with ${label}: should answer with XML`).toBe(200);
        expect(response.returncode, `join with ${label}: should ${joins ? 'succeed' : 'fail'}`).toEqual([
          joins ? 'SUCCESS' : 'FAILED',
        ]);
        expect(Boolean(response.session_token), `join with ${label}: session token`).toBe(joins);
      }
    } finally {
      await endMeetings(request, [withPasswords, withoutPasswords]);
    }
  }

  // redirect=false answers with the session fields instead of redirecting to
  // the client; without it the join redirects to the client URL.
  static async testRedirectFalseReturnsSession(request: APIRequestContext) {
    const meetingID = `join-redirect-${getRandomInt(1000000, 10000000)}`;
    try {
      const created = await createWithParams(request, { name: meetingID, meetingID });
      const { status, response } = await join(request, {
        fullName: 'NoRedirect',
        meetingID,
        role: 'VIEWER',
        redirect: 'false',
      });
      expect(status, 'should answer with XML instead of a redirect').toBe(200);
      expect(response).toMatchObject({
        returncode: ['SUCCESS'],
        messageKey: ['successfullyJoined'],
        meeting_id: created.internalMeetingID,
        guestStatus: ['ALLOW'],
      });
      expect(response.user_id?.[0], 'should return the internal user ID').toMatch(/^w_[a-z0-9]+$/);
      expect(response.auth_token?.[0], 'should return the auth token').toMatch(/^[a-z0-9]+$/);
      const sessionToken = response.session_token?.[0] as string;
      expect(sessionToken, 'should return the session token').toMatch(/^[a-z0-9]+$/);
      expect(response.url?.[0], 'the client URL should carry the session token').toContain(
        `sessionToken=${sessionToken}`,
      );

      const redirected = await join(request, { fullName: 'Redirect', meetingID, role: 'VIEWER' });
      expect(redirected.status, 'without redirect=false the join should redirect').toBe(302);
      expect(redirected.location, 'the redirect should open the client with a session').toMatch(
        /sessionToken=[a-z0-9]+/,
      );
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // A join to a meeting that was never created redirects with an error and
  // opens no session.
  static async testUnknownMeetingRefused(request: APIRequestContext) {
    const { status, location, redirectErrors } = await join(request, {
      fullName: 'Nobody',
      meetingID: `never-created-${getRandomInt(1000000, 10000000)}`,
      role: 'VIEWER',
    });
    expect(status, 'should redirect').toBe(302);
    expect(location, 'should not open a session').not.toContain('sessionToken');
    expect(redirectErrors?.length, 'the redirect should carry an error').toBeGreaterThan(0);
    return redirectErrors;
  }

  // The documented message key for an unknown meeting is
  // invalidMeetingIdentifier; bbb-web reports meetingForciblyEnded, because the
  // ended-meeting check also fails for a meeting that does not exist and its
  // error wins.
  static async testUnknownMeetingErrorKey(request: APIRequestContext) {
    const redirectErrors = await APIJoin.testUnknownMeetingRefused(request);
    expect(redirectErrors?.map(({ key }) => key)).toEqual(['invalidMeetingIdentifier']);
  }

  // With redirect=false the join is documented to answer with XML whether it
  // succeeds or not; bbb-web still redirects when a parameter fails
  // validation, because the redirect flag is read after validation.
  static async testValidationErrorWithRedirectFalse(request: APIRequestContext) {
    const meetingID = `join-xml-error-${getRandomInt(1000000, 10000000)}`;
    try {
      await createWithParams(request, { name: meetingID, meetingID });
      const { status, response } = await join(request, {
        fullName: 'a'.repeat(300),
        meetingID,
        role: 'VIEWER',
        redirect: 'false',
      });
      expect(status, 'should answer with XML instead of a redirect').toBe(200);
      expect(response).toMatchObject({ returncode: ['FAILED'], messageKey: ['fullNameTooLong'] });
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }

  // maxParticipants=1: once one user is in the meeting, another user's join is
  // refused.
  async testMaxParticipants(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { testInfo, createParameter: 'maxParticipants=1' });
    const { meetingId } = this.modPage;
    try {
      await expect.poll(() => isMeetingRunning(request, meetingId), pollOptions).toBe('true');
      const { status, response } = await join(request, {
        fullName: 'OneTooMany',
        meetingID: meetingId,
        role: 'VIEWER',
        redirect: 'false',
      });
      expect(status).toBe(200);
      expect(response, 'the join beyond maxParticipants should be refused').toMatchObject({
        returncode: ['FAILED'],
        messageKey: ['maxParticipantsReached'],
      });
      expect(response.session_token, 'the refused join should not open a session').toBeUndefined();
    } finally {
      await endMeetings(request, [meetingId]);
    }
  }
}
