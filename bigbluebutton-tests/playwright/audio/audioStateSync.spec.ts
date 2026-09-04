import { type Browser, expect, type TestInfo, type WebSocketRoute } from '@playwright/test';

import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  PASSIVE_REMOVAL_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { Audio } from './audio';
import {
  APOLLO_CLIENT_SETTINGS_MODULE,
  expectUserRemoved,
  getMeetingUserIds,
  getOwnUserId,
  getUnsyncedVoiceUsers,
  isApolloClientExposed,
} from './floorProbe';
import {
  exposeLiveKitRoom,
  forceRoomReconnect,
  getAudioPublisherIdentities,
  getLocalMicState,
  getRemoteAudioStates,
  reconnectWithExistingToken,
  republishMicrophone,
  suppressRoomDisconnect,
} from './liveKitProbe';
import { connectMicrophone, ensureUnmuted } from './util';

const VIEWER_NAME = 'StrandedViewer';

const APOLLO_EXPOSURE_SKIP_REASON =
  'requires window.__APOLLO_CLIENT__ for the server-state probe ' +
  '(dev bundle or enableApolloDevTools provisioned via clientSettingsOverride)';

// VoiceUser <-> Users2x enforcement timer. Fencing usually lands with user
// removal, so the removal budget plus one element wait for LK's own ejection
// timer.
const ENFORCEMENT_WAIT_TIME = PASSIVE_REMOVAL_WAIT_TIME + ELEMENT_WAIT_EXTRA_LONG_TIME;

// A still-flowing media stream would add hundreds of packets in this.
const SILENCE_SAMPLE_WINDOW = 3_000;

// Two pages joining a meeting and then audio. Built from element waits so it
// scales with the CI multiplier, which the fixed budgets above do not.
const FIXTURE_SETUP_BUDGET = ELEMENT_WAIT_EXTRA_LONG_TIME * 4;

interface AudioStateSyncFixture {
  audio: Audio;
  modPage: Page;
  viewerPage: Page;
  viewerUserId: string;
  cutGraphql: () => Promise<void>;
  restoreGraphql: () => void;
}

// Moderator (server-state probe) + viewer (unmuted publisher), both exposing
// window.liveKitRoom. The viewer's GraphQL socket is proxied so it can be cut
// without touching LiveKit.
const initAudioStateSyncScenario = async (browser: Browser, testInfo: TestInfo): Promise<AudioStateSyncFixture> => {
  const context = await browser.newContext();
  const audio = new Audio(browser, context);

  const modRawPage = await context.newPage();
  await exposeLiveKitRoom(modRawPage);
  await audio.initModPage(modRawPage, { testInfo, createModules: APOLLO_CLIENT_SETTINGS_MODULE });
  const { modPage } = audio;
  test.skip(!(await isApolloClientExposed(modPage.page, ELEMENT_WAIT_TIME)), APOLLO_EXPOSURE_SKIP_REASON);

  const viewerRawPage = await context.newPage();
  await exposeLiveKitRoom(viewerRawPage);

  let blockGraphql = false;
  const liveSockets = new Set<WebSocketRoute>();
  await viewerRawPage.routeWebSocket('**/graphql', (ws) => {
    if (blockGraphql) {
      ws.close();
      return;
    }
    ws.connectToServer();
    liveSockets.add(ws);
  });

  const viewerPage = new Page(browser, viewerRawPage, testInfo);
  await viewerPage.init(false, { fullName: VIEWER_NAME, meetingId: modPage.meetingId, testInfo });
  audio.userPage = viewerPage;

  await modPage.waitAndClick(e.joinAudio);
  await connectMicrophone(modPage);
  await viewerPage.waitAndClick(e.joinAudio);
  await connectMicrophone(viewerPage);
  await ensureUnmuted(viewerPage);

  return {
    audio,
    modPage,
    viewerPage,
    viewerUserId: await getOwnUserId(viewerPage.page),
    cutGraphql: async () => {
      blockGraphql = true;
      await Promise.all([...liveSockets].map((ws) => ws.close()));
    },
    // The client retries on its own, so lifting the block is enough for it to
    // reconnect and re-fire userJoin, which is what triggers the restore.
    restoreGraphql: () => {
      blockGraphql = false;
    },
  };
};

// Two conditions to check: nobody publishes audio without a matching BBB user,
// and any voice row without one is inert. Media is checked first.
const expectNoUnknownAudioParticipant = async (
  fixture: AudioStateSyncFixture,
  removedUserId: string,
  timeout: number,
): Promise<void> => {
  const { modPage } = fixture;
  await expect(async () => {
    const publishers = await getAudioPublisherIdentities(modPage.page);
    expect(publishers, 'should not receive audio from a participant who is not in the meeting').not.toContain(
      removedUserId,
    );
    // A voice row with no meeting user is is fenced by BBB. What must
    // not survive is a fenced user still talking or holding the floor.
    const unsynced = await getUnsyncedVoiceUsers(modPage.page);
    const loud = unsynced.filter((row) => row.talking || row.floor || !row.muted);
    expect(loud, 'a voice user with no meeting user should be muted and hold no floor').toEqual([]);
  }).toPass({ timeout });

  // The check above is publication-level and would also pass on a merely muted
  // offender, and mute is signalled state. Enforcement revokes canPublish, so the
  // guarantee is "present with nothing published", not eviction.
  const states = await getRemoteAudioStates(modPage.page);
  const orphan = states.find((state) => state.identity === removedUserId);
  const detail = JSON.stringify(states);
  if (orphan) {
    expect(orphan.micPublications, `a user who is not in the meeting should publish no audio (${detail})`).toBe(0);
    expect(orphan.subscribed, `a user who is not in the meeting should have no subscribed audio (${detail})`).toBe(0);
    expect(orphan.liveTracks, `a user who is not in the meeting should have no live audio track (${detail})`).toBe(0);
  }
};

// Proves no media is arriving at the packet level, independent of signalled state.
const expectNoInboundAudio = async (fixture: AudioStateSyncFixture, removedUserId: string): Promise<void> => {
  const { modPage } = fixture;
  const read = async () =>
    (await getRemoteAudioStates(modPage.page)).find((state) => state.identity === removedUserId)?.packetsReceived ?? 0;

  const before = await read();
  await modPage.page.waitForTimeout(SILENCE_SAMPLE_WINDOW);
  const after = await read();
  // Negative means the participant went away between reads, which is also a pass.
  expect(after - before, 'should not receive any audio RTP from a user who is not in the meeting').toBeLessThanOrEqual(
    0,
  );
};

const expectAudioIsFlowing = async (fixture: AudioStateSyncFixture): Promise<void> => {
  const { modPage, viewerPage, viewerUserId } = fixture;
  await expect(async () => {
    const local = await getLocalMicState(viewerPage.page);
    expect(local.roomState, 'the viewer should be connected to the LiveKit room').toBe('connected');
    expect(local.micPublications, 'the viewer should publish a microphone track').toBeGreaterThan(0);
    expect(local.allMuted, 'the viewer should be unmuted').toBe(false);
    const publishers = await getAudioPublisherIdentities(modPage.page);
    expect(publishers, 'the moderator should receive the viewer audio before the removal').toContain(viewerUserId);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

// Best effort: the server is meant to keep the tab out, so a failure here is a
// correct outcome rather than a test error. The assertion that follows decides.
const attemptToResumePublishing = async (
  fixture: AudioStateSyncFixture,
  how: 'simulate-reconnect' | 'rejoin-with-token',
): Promise<void> => {
  const { viewerPage } = fixture;
  try {
    if (how === 'simulate-reconnect') await forceRoomReconnect(viewerPage.page);
    else await reconnectWithExistingToken(viewerPage.page);
    await republishMicrophone(viewerPage.page);
  } catch {
    // Swallowed on purpose.
  }
};

test.describe('Audio state sync', { tag: ['@ci', '@media'] }, () => {
  test.beforeEach(() => {
    test.skip(!isLiveKit, 'audio state sync enforcement is specific to the LiveKit audio bridge');
  });

  // A viewer whose client stops talking to the server is removed by the user-left
  // sweep, then their still-open tab reconnects to LiveKit.
  test('a passively removed user cannot rejoin audio', async ({ browser }, testInfo) => {
    const fixture = await initAudioStateSyncScenario(browser, testInfo);
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectAudioIsFlowing(fixture);

    // The tab never processes its own removal - the premise of the bug.
    expect(await suppressRoomDisconnect(viewerPage.page), 'should expose the viewer LiveKit room').toBe(true);

    await fixture.cutGraphql();
    await expectUserRemoved(
      modPage.page,
      viewerUserId,
      'should drop the viewer from the meeting once the user-left flag expires',
      PASSIVE_REMOVAL_WAIT_TIME,
    );

    await attemptToResumePublishing(fixture, 'simulate-reconnect');
    await expectNoUnknownAudioParticipant(fixture, viewerUserId, ENFORCEMENT_WAIT_TIME);
    await expectNoInboundAudio(fixture, viewerUserId);
  });

  // The other half of enforcement: a user who comes back has to end up whole -
  // publishing again, and with the voice record they were fenced under.
  // With the primary Room kept across the membership remount, the suppressed
  // disconnect leaves the old session connected and the remount's connect is a
  // no-op, so the restore is proven on that session rather than on a fresh one;
  // the canPublish controls below hold either way.
  test('a fenced user regains audio when they are re-admitted', async ({ browser }, testInfo) => {
    // Longer than the 3min default: this is the only case that waits out a removal
    // and a re-admission, so it pays both budgets twice - once fencing, once
    // restoring. Derived so it follows if either budget is retuned.
    test.setTimeout(
      FIXTURE_SETUP_BUDGET + ELEMENT_WAIT_LONGER_TIME + (PASSIVE_REMOVAL_WAIT_TIME + ENFORCEMENT_WAIT_TIME) * 2,
    );

    const fixture = await initAudioStateSyncScenario(browser, testInfo);
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectAudioIsFlowing(fixture);

    // Keep the media session up across the outage: this is the population fencing exists for.
    expect(await suppressRoomDisconnect(viewerPage.page), 'should expose the viewer LiveKit room').toBe(true);

    await fixture.cutGraphql();
    await expectUserRemoved(
      modPage.page,
      viewerUserId,
      'should drop the viewer from the meeting once the user-left flag expires',
      PASSIVE_REMOVAL_WAIT_TIME,
    );

    // canPublish is pushed down by LiveKit, so it says the grant was revoked
    // rather than that the client stopped publishing.
    await expect(async () => {
      const local = await getLocalMicState(viewerPage.page);
      expect(local.canPublish, 'the fenced viewer should lose publish rights').toBe(false);
    }).toPass({ timeout: ENFORCEMENT_WAIT_TIME });

    // Fencing keeps the voice record.
    const fenced = await getUnsyncedVoiceUsers(modPage.page);
    expect(
      fenced.map((row) => row.userId),
      'a fenced session should keep its voice record so it stays visible',
    ).toContain(viewerUserId);
    expect(
      fenced.filter((row) => row.talking || row.floor || !row.muted),
      'a fenced voice user should be muted and hold no floor',
    ).toEqual([]);

    fixture.restoreGraphql();
    await expect(async () => {
      const userIds = await getMeetingUserIds(modPage.page);
      expect(userIds, 'the viewer should be re-admitted once GraphQL recovers').toContain(viewerUserId);
    }).toPass({ timeout: PASSIVE_REMOVAL_WAIT_TIME });

    // The client does not republish on its own, so drive it inside the loop: a
    // single attempt before it could race the restore.
    await expect(async () => {
      const local = await getLocalMicState(viewerPage.page);
      expect(local.canPublish, 'a re-admitted user should have publish rights restored').toBe(true);
      await republishMicrophone(viewerPage.page);
      const publishers = await getAudioPublisherIdentities(modPage.page);
      expect(publishers, 'the moderator should hear a re-admitted user again').toContain(viewerUserId);
    }).toPass({ timeout: ENFORCEMENT_WAIT_TIME });
  });

  // Same invariant under an explicit user eject. LiveKit does kick the participant,
  // but the client can still try to rejoin with its existing token.
  test('an ejected user cannot rejoin audio with their existing LiveKit token', async ({ browser }, testInfo) => {
    const fixture = await initAudioStateSyncScenario(browser, testInfo);
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectAudioIsFlowing(fixture);

    expect(await suppressRoomDisconnect(viewerPage.page), 'should expose the viewer LiveKit room').toBe(true);

    await modPage.waitAndClick(e.usersListSidebarButton);
    // Scoped to the viewer: the user item selector matches every row, including
    // the moderator's own.
    const viewerRow = modPage.page.locator(e.userListItem).filter({ hasText: VIEWER_NAME });
    await viewerRow.locator(e.moreOptionsUserItemButton).click();
    await modPage.waitAndClick(e.removeUser);
    await modPage.waitAndClick(e.removeUserConfirmationBtn);
    await expectUserRemoved(
      modPage.page,
      viewerUserId,
      'should drop the ejected viewer from the meeting',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Re-entering is what the client's own connect effect does when it re-fires.
    await attemptToResumePublishing(fixture, 'rejoin-with-token');
    await expectNoUnknownAudioParticipant(fixture, viewerUserId, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await expectNoInboundAudio(fixture, viewerUserId);
  });
});
