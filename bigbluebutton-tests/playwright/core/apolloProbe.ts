import { expect, type Page as PlaywrightPage } from '@playwright/test';

/* eslint-disable no-underscore-dangle */

// Generic machinery for probing server state through the in-page Apollo client.
//
// Some meeting state (audio floor, LiveKit room memberships, ...) lives
// server-side behind Hasura views with no guaranteed UI surface. These helpers
// let specs read that state straight from GraphQL by driving Apollo's own
// devtools global, window.__APOLLO_CLIENT__.
//
// That client is only published at window-level when enableApolloDevTools is on
// or the client is a dev bundle, so any spec using this module must enable it
// via clientSettingsOverride (APOLLO_CLIENT_SETTINGS_MODULE) on meeting create
// and guarantee isApolloClientExposed before using this.

interface FieldNode {
  kind: string;
  name: { kind: string; value: string };
  selectionSet?: { kind: string; selections: FieldNode[] };
}

// Minimal hand-built GraphQL AST builders. Kept dependency-free so the probe
// works against the meeting's own Apollo client without importing graphql/gql
// into the test bundle.
export const field = (name: string, selections?: FieldNode[]): FieldNode => ({
  kind: 'Field',
  name: { kind: 'Name', value: name },
  ...(selections ? { selectionSet: { kind: 'SelectionSet', selections } } : {}),
});

export const queryDocument = (selections: FieldNode[]) => ({
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      selectionSet: { kind: 'SelectionSet', selections },
    },
  ],
});

type ApolloQueryWindow = Window & {
  __APOLLO_CLIENT__?: {
    query: (options: object) => Promise<{ data: Record<string, unknown> }>;
    mutate: (options: object) => Promise<{ data: Record<string, unknown> | null; errors?: { message: string }[] }>;
  };
};

export const APOLLO_CLIENT_SETTINGS_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  JSON.stringify({ public: { app: { enableApolloDevTools: true } } }),
  ']]></module></modules>',
].join('');

export const isApolloClientExposed = (page: PlaywrightPage, timeout: number): Promise<boolean> =>
  page
    .waitForFunction(() => !!(window as ApolloQueryWindow).__APOLLO_CLIENT__, undefined, { timeout })
    .then(
      () => true,
      () => false,
    );

export const runQuery = async (page: PlaywrightPage, queryAst: object): Promise<Record<string, unknown>> =>
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

// -- Mutations --
//
// Hand-built mutation ASTs mirroring the query builders above. String arguments
// are bound to GraphQL *variables* (never inlined as literals): the values ride
// in a plain `variables` object that the in-page Apollo client hands straight to
// the server, so no literal (re)serialization can corrupt them.

// A single-root-field mutation (BBB fire-and-forget actions return Boolean) whose
// arguments are all declared as non-null String variables. `document` is a plain,
// JSON-serializable DocumentNode so it survives the page.evaluate boundary; the
// bare-string values travel alongside it in `variables`.
export interface MutationRequest {
  document: object;
  variables: Record<string, string>;
}

export const stringVarMutation = (fieldName: string, args: Record<string, string>): MutationRequest => {
  const names = Object.keys(args);
  return {
    document: {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'mutation',
          variableDefinitions: names.map((name) => ({
            kind: 'VariableDefinition',
            variable: { kind: 'Variable', name: { kind: 'Name', value: name } },
            type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
          })),
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: { kind: 'Name', value: fieldName },
                arguments: names.map((name) => ({
                  kind: 'Argument',
                  name: { kind: 'Name', value: name },
                  value: { kind: 'Variable', name: { kind: 'Name', value: name } },
                })),
              },
            ],
          },
        },
      ],
    },
    variables: { ...args },
  };
};

export interface MutationResult {
  data: Record<string, unknown> | null;
  errors: string[];
}

// Fires a mutation through the in-page Apollo client. Uses errorPolicy 'all' so a
// server-rejected action resolves (surfacing errors) instead of throwing, letting
// adversarial specs assert on the resulting server state rather than on the call.
export const runMutation = async (page: PlaywrightPage, request: MutationRequest): Promise<MutationResult> =>
  page.evaluate(async ({ document, variables }) => {
    const w = window as ApolloQueryWindow;
    if (!w.__APOLLO_CLIENT__) {
      throw new Error(
        'window.__APOLLO_CLIENT__ is not exposed - the meeting needs enableApolloDevTools (clientSettingsOverride) or a development bundle',
      );
    }
    const res = await w.__APOLLO_CLIENT__.mutate({ mutation: document, variables, errorPolicy: 'all' });
    return {
      data: res.data ?? null,
      errors: (res.errors ?? []).map((err) => err.message),
    };
  }, request);

const USER_CURRENT_QUERY = queryDocument([field('user_current', [field('userId')])]);

export const getOwnUserId = async (page: PlaywrightPage): Promise<string> => {
  const data = await runQuery(page, USER_CURRENT_QUERY);
  const rows = data.user_current as { userId: string }[];
  if (!rows?.length) throw new Error('user_current returned no rows');
  return rows[0].userId;
};

const MEETING_QUERY = queryDocument([field('meeting', [field('meetingId')])]);

// The internal meetingId (a hash) of the caller's own meeting — distinct from the
// external meetingID passed to /api/create|join that Page.meetingId holds.
export const getOwnMeetingId = async (page: PlaywrightPage): Promise<string> => {
  const data = await runQuery(page, MEETING_QUERY);
  const rows = data.meeting as { meetingId: string }[];
  if (!rows?.length) throw new Error('meeting returned no rows');
  return rows[0].meetingId;
};

// --- LiveKit room memberships (user_livekit_room view) -----------------------
//
// Matches the client's livekitRooms selection on the current-user subscription
// (bigbluebutton-html5/imports/ui/components/livekit/memberships-manager). The
// Hasura select_permission filters user_livekit_room to the caller's own rows
// (X-Hasura-MeetingId + X-Hasura-UserId), so any joined page observes exactly
// its own memberships. `token` is fetched only to derive hasToken and is never
// returned to the spec.

const USER_LIVEKIT_ROOM_QUERY = queryDocument([
  field('user_livekit_room', [field('roomName'), field('purpose'), field('token')]),
]);

export interface LiveKitMembershipRow {
  roomName: string;
  purpose: string;
  hasToken: boolean;
}

export const getLiveKitMembershipRows = async (page: PlaywrightPage): Promise<LiveKitMembershipRow[]> => {
  const data = await runQuery(page, USER_LIVEKIT_ROOM_QUERY);
  const rows = (data.user_livekit_room ?? []) as Array<{
    roomName: string;
    purpose: string;
    token: string | null;
  }>;
  return rows.map((row) => ({
    roomName: row.roomName,
    purpose: row.purpose,
    hasToken: row.token != null,
  }));
};

// Polls until the user observed from `page` holds a valid LK membership
// for `roomName` with the given `purpose`.
export const expectLiveKitMembership = async (
  page: PlaywrightPage,
  expected: { roomName: string; purpose: string },
  message: string,
  timeout: number,
): Promise<void> => {
  await expect(async () => {
    const rows = await getLiveKitMembershipRows(page);
    const held = rows.some(
      (row) => row.roomName === expected.roomName && row.purpose === expected.purpose && row.hasToken,
    );
    expect(held, message).toBe(true);
  }).toPass({ timeout });
};
