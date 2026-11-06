import { type APIRequestContext, expect } from '@playwright/test';

import { endMeetings, getApiCallUrl, getRandomInt, requestApiCall } from '../core/helpers';

// The three guest policies the create API documents. ALWAYS_ACCEPT_AUTH used
// to be a fourth, never documented; bbb-web now treats it as ASK_MODERATOR.
const ALWAYS_ACCEPT = 'ALWAYS_ACCEPT';
const ALWAYS_DENY = 'ALWAYS_DENY';
const ASK_MODERATOR = 'ASK_MODERATOR';
const RETIRED_ALWAYS_ACCEPT_AUTH = 'ALWAYS_ACCEPT_AUTH';

type JoinStatus = 'ALLOW' | 'WAIT' | 'DENY';

async function createWithGuestPolicy(request: APIRequestContext, meetingID: string, guestPolicy?: string) {
  const params: Record<string, string> = { name: meetingID, meetingID };
  if (guestPolicy !== undefined) params.guestPolicy = guestPolicy;
  const { response } = await requestApiCall(request, getApiCallUrl('create', params));
  expect(response.returncode, `create ${meetingID} (guestPolicy=${guestPolicy ?? 'unset'}) should succeed`).toEqual([
    'SUCCESS',
  ]);
}

// What the join API decides for a viewer: the guestStatus of a successful
// join, or DENY when the policy refuses the join (guestDeniedAccess).
async function joinStatus(request: APIRequestContext, meetingID: string, asGuest: boolean): Promise<JoinStatus> {
  const who = asGuest ? 'a guest' : 'a plain viewer';
  const params: Record<string, string> = {
    fullName: `${asGuest ? 'Guest' : 'Viewer'}-${getRandomInt(1000, 10000)}`,
    meetingID,
    role: 'VIEWER',
    redirect: 'false',
  };
  if (asGuest) params.guest = 'true';
  const { status, response, redirectErrors } = await requestApiCall(request, getApiCallUrl('join', params));
  const denied =
    response.messageKey?.[0] === 'guestDeniedAccess' ||
    (redirectErrors ?? []).some(({ key }) => key === 'guestDeniedAccess');
  if (denied) return 'DENY';
  expect(status, `join of ${who} to ${meetingID} should answer with XML`).toBe(200);
  expect(response.returncode, `join of ${who} to ${meetingID} should succeed`).toEqual(['SUCCESS']);
  const guestStatus = response.guestStatus?.[0];
  expect(['ALLOW', 'WAIT'], `join of ${who} to ${meetingID} should carry a guestStatus`).toContain(guestStatus);
  return guestStatus as JoinStatus;
}

async function joinStatuses(request: APIRequestContext, meetingID: string) {
  return {
    guest: await joinStatus(request, meetingID, true),
    viewer: await joinStatus(request, meetingID, false),
  };
}

const newMeetingID = (label: string) => `guest-policy-${label}-${getRandomInt(1000000, 10000000)}`;

export class APIGuestPolicy {
  // The documented values, as the join API applies them with the shipped
  // authenticatedGuest=true: ASK_MODERATOR makes every viewer wait, guest or
  // not; ALWAYS_ACCEPT lets everyone in; ALWAYS_DENY refuses the guest.
  static async testPolicyDecidesJoinStatus(request: APIRequestContext) {
    const meetings = {
      [ALWAYS_ACCEPT]: newMeetingID('accept'),
      [ASK_MODERATOR]: newMeetingID('ask'),
      [ALWAYS_DENY]: newMeetingID('deny'),
    };
    try {
      for (const [policy, meetingID] of Object.entries(meetings)) {
        await createWithGuestPolicy(request, meetingID, policy);
      }
      expect(await joinStatuses(request, meetings[ALWAYS_ACCEPT]), 'ALWAYS_ACCEPT').toEqual({
        guest: 'ALLOW',
        viewer: 'ALLOW',
      });
      expect(await joinStatuses(request, meetings[ASK_MODERATOR]), 'ASK_MODERATOR').toEqual({
        guest: 'WAIT',
        viewer: 'WAIT',
      });
      expect(await joinStatus(request, meetings[ALWAYS_DENY], true), 'ALWAYS_DENY, guest').toBe('DENY');
    } finally {
      await endMeetings(request, Object.values(meetings));
    }
  }

  // ALWAYS_ACCEPT_AUTH used to let plain viewers in while guests waited. It is
  // no longer a policy of its own: a meeting created with it behaves exactly
  // like one created with ASK_MODERATOR, for guests and plain viewers alike.
  static async testAlwaysAcceptAuthTreatedAsAskModerator(request: APIRequestContext) {
    const retired = newMeetingID('retired');
    const askModerator = newMeetingID('ask');
    try {
      await createWithGuestPolicy(request, retired, RETIRED_ALWAYS_ACCEPT_AUTH);
      await createWithGuestPolicy(request, askModerator, ASK_MODERATOR);
      const expected = await joinStatuses(request, askModerator);
      expect(await joinStatuses(request, retired), 'ALWAYS_ACCEPT_AUTH should behave like ASK_MODERATOR').toEqual(
        expected,
      );
      expect(expected.viewer, 'a plain viewer waits under ASK_MODERATOR (authenticatedGuest=true)').toBe('WAIT');
    } finally {
      await endMeetings(request, [retired, askModerator]);
    }
  }

  // A guestPolicy value bbb-web does not know, including a differently cased
  // one, is ignored: the meeting gets the server default, the same as a create
  // without the parameter. Before this was validated, such a meeting refused
  // every viewer.
  static async testInvalidValueUsesServerDefault(request: APIRequestContext) {
    const withoutParameter = newMeetingID('default');
    const typo = newMeetingID('typo');
    const lowerCase = newMeetingID('lowercase');
    try {
      await createWithGuestPolicy(request, withoutParameter);
      await createWithGuestPolicy(request, typo, 'ASK_MODERATORS');
      await createWithGuestPolicy(request, lowerCase, 'ask_moderator');
      const expected = await joinStatuses(request, withoutParameter);
      expect(await joinStatuses(request, typo), 'a misspelled guestPolicy should fall back to the default').toEqual(
        expected,
      );
      expect(
        await joinStatuses(request, lowerCase),
        'a lower-case guestPolicy should fall back to the default',
      ).toEqual(expected);
    } finally {
      await endMeetings(request, [withoutParameter, typo, lowerCase]);
    }
  }
}
