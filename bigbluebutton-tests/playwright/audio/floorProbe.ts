import { expect, type Page as PlaywrightPage } from '@playwright/test';

// window.__APOLLO_CLIENT__ is Apollo's own devtools global - the name is not ours to change.
/* eslint-disable no-underscore-dangle */

// The audio floor state lives server-side (user_voice.floor/lastFloorTime) and
// has no dedicated UI element other than the non-guaranteed video grid sorting.
// This is a way for tests to read floor state through GraphQL directly via Apollo.
// (window.__APOLLO_CLIENT__).
// That client is only available at window-level when enableApolloDevTools is on
// or we have a dev bundle, so whichever specs use this util need to enable it via
// clientSettingsOverride.

interface FieldNode {
  kind: string;
  name: { kind: string; value: string };
  selectionSet?: { kind: string; selections: FieldNode[] };
}

const field = (name: string, selections?: FieldNode[]): FieldNode => ({
  kind: 'Field',
  name: { kind: 'Name', value: name },
  ...(selections ? { selectionSet: { kind: 'SelectionSet', selections } } : {}),
});

const queryDocument = (selections: FieldNode[]) => ({
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      selectionSet: { kind: 'SelectionSet', selections },
    },
  ],
});

const USER_VOICE_QUERY = queryDocument([
  field('user_voice', [field('userId'), field('talking'), field('floor'), field('lastFloorTime'), field('muted')]),
]);

const USER_CURRENT_QUERY = queryDocument([field('user_current', [field('userId')])]);

const USER_QUERY = queryDocument([field('user', [field('userId'), field('name')])]);

export interface UserVoiceRow {
  userId: string;
  talking: boolean;
  floor: boolean;
  lastFloorTime: string;
  muted: boolean;
}

type ApolloQueryWindow = Window & {
  __APOLLO_CLIENT__?: {
    query: (options: object) => Promise<{ data: Record<string, unknown> }>;
  };
};

export const APOLLO_CLIENT_SETTINGS_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  JSON.stringify({ public: { app: { enableApolloDevTools: true } } }),
  ']]></module></modules>',
].join('');

// Guard for the specs: false when the bundle did not publish the client (i.e.
// a production build whose meeting was created without the settings module
// taking effect).
export const isApolloClientExposed = (page: PlaywrightPage, timeout: number): Promise<boolean> =>
  page
    .waitForFunction(() => !!(window as ApolloQueryWindow).__APOLLO_CLIENT__, undefined, { timeout })
    .then(
      () => true,
      () => false,
    );

const runQuery = async (page: PlaywrightPage, queryAst: object): Promise<Record<string, unknown>> =>
  page.evaluate(async (ast) => {
    const w = window as ApolloQueryWindow;
    if (!w.__APOLLO_CLIENT__) {
      throw new Error(
        'window.__APOLLO_CLIENT__ is not exposed - the meeting needs enableApolloDevTools (clientSettingsOverride) or a development bundle',
      );
    }
    const res = await w.__APOLLO_CLIENT__.query({ query: ast, fetchPolicy: 'network-only' });
    return res.data;
  }, queryAst);

// user_voice is row-filtered by Hasura to the caller's meeting, so any joined page
// observes exactly its own meeting's voice rows.
export const getUserVoiceRows = async (page: PlaywrightPage): Promise<UserVoiceRow[]> => {
  const data = await runQuery(page, USER_VOICE_QUERY);
  return data.user_voice as UserVoiceRow[];
};

export const getOwnUserId = async (page: PlaywrightPage): Promise<string> => {
  const data = await runQuery(page, USER_CURRENT_QUERY);
  const rows = data.user_current as { userId: string }[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return rows[0].userId;
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
