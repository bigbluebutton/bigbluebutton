import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { field, queryDocument, runQuery } from '../core/apolloProbe';

// The audio floor state lives server-side (user_voice.floor/lastFloorTime) and
// has no dedicated UI element other than the non-guaranteed video grid sorting,
// so tests here read it through GraphQL directly via the in-page Apollo client.
// See core/apolloProbe for the enableApolloDevTools / clientSettingsOverride
// requirement.

export { APOLLO_CLIENT_SETTINGS_MODULE, getOwnUserId, isApolloClientExposed } from '../core/apolloProbe';

const USER_VOICE_QUERY = queryDocument([
  field('user_voice', [field('userId'), field('talking'), field('floor'), field('lastFloorTime'), field('muted')]),
]);

const USER_QUERY = queryDocument([field('user', [field('userId'), field('name')])]);

export interface UserVoiceRow {
  userId: string;
  talking: boolean;
  floor: boolean;
  lastFloorTime: string;
  muted: boolean;
}

// user_voice is row-filtered by Hasura to the caller's meeting, so any joined page
// observes exactly its own meeting's voice rows.
export const getUserVoiceRows = async (page: PlaywrightPage): Promise<UserVoiceRow[]> => {
  const data = await runQuery(page, USER_VOICE_QUERY);
  return data.user_voice as UserVoiceRow[];
};

export const getFloorHolders = async (page: PlaywrightPage): Promise<string[]> => {
  const rows = await getUserVoiceRows(page);
  return rows.filter((row) => row.floor).map((row) => row.userId);
};

export const getMeetingUserIds = async (page: PlaywrightPage): Promise<string[]> => {
  const data = await runQuery(page, USER_QUERY);
  return (data.user as { userId: string }[]).map((row) => row.userId);
};

// Voice rows with no matching meeting user - an orphan, in akka's terms.
export const getUnsyncedVoiceUsers = async (page: PlaywrightPage): Promise<UserVoiceRow[]> => {
  const [voiceRows, userIds] = await Promise.all([getUserVoiceRows(page), getMeetingUserIds(page)]);
  const present = new Set(userIds);
  return voiceRows.filter((row) => !present.has(row.userId));
};

// Polls until `userId` is gone from the meeting's user list.
export const expectUserRemoved = async (
  page: PlaywrightPage,
  userId: string,
  message: string,
  timeout: number,
): Promise<void> => {
  await expect(async () => {
    expect(await getMeetingUserIds(page), message).not.toContain(userId);
  }).toPass({ timeout });
};

// Polls until the meeting observed from `page` has exactly one floor holder: `userId`.
export const expectFloorHolder = async (
  page: PlaywrightPage,
  userId: string,
  message: string,
  timeout: number,
): Promise<void> => {
  await expect(async () => {
    const holders = await getFloorHolders(page);
    expect(holders, message).toEqual([userId]);
  }).toPass({ timeout });
};
