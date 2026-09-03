import {
  type Browser,
  expect,
  type Page as PlaywrightPage,
  type TestInfo,
  type WebSocketRoute,
} from '@playwright/test';

import { getLiveKitMembershipRows } from '../core/apolloProbe';
import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  PASSIVE_REMOVAL_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { Audio } from './audio';
import {
  APOLLO_CLIENT_SETTINGS_MODULE,
  expectUserRemoved,
  getMeetingUserIds,
  getOwnUserId,
  getUserVoiceRows,
  isApolloClientExposed,
} from './floorProbe';
import {
  exposeLiveKitRoom,
  getAudioPublisherIdentities,
  getLocalMicState,
  getRemoteAudioStates,
  type TestWindow,
} from './liveKitProbe';
import { connectMicrophone, ensureUnmuted } from './util';

export const VIEWER_NAME = 'ReconnViewer';

export const APOLLO_EXPOSURE_SKIP_REASON =
  'requires window.__APOLLO_CLIENT__ for the server-state probe ' +
  '(dev bundle, or enableApolloDevTools provisioned via clientSettingsOverride, which needs ' +
  'allowOverrideClientSettingsOnCreateCall=true on the server)';

export { PASSIVE_REMOVAL_WAIT_TIME };
// GraphQL retry (10s) + userJoin + token mint + room connect.
export const REJOIN_WAIT_TIME = ELEMENT_WAIT_EXTRA_LONG_TIME * 4;
// Past unpublishAfterMuteMs (5s, a client-side timer that does not scale with
// the suite multiplier) so a mute has actually unpublished the track.
export const UNPUBLISH_SETTLE_TIME = 7_000;
// Full reconnect against a live server: leave, rejoin, republish.
export const RECONNECT_WAIT_TIME = ELEMENT_WAIT_EXTRA_LONG_TIME * 2;
// A flowing microphone adds dozens of RTP packets in this.
export const AUDIO_SAMPLE_WINDOW = 1_000;

interface RoomHandle {
  bbbTestTag?: string;
  options: { stopLocalTrackOnUnpublish?: boolean; dynacast?: boolean };
  localParticipant: {
    roomOptions: { stopLocalTrackOnUnpublish?: boolean; dynacast?: boolean };
    videoTrackPublications: Map<string, { source: string; isMuted: boolean; trackSid?: string }>;
  };
  remoteParticipants: Map<
    string,
    {
      identity: string;
      videoTrackPublications: Map<
        string,
        {
          source: string;
          isSubscribed: boolean;
          track?: { mediaStreamTrack?: { readyState: string } };
        }
      >;
    }
  >;
}

// The readers below use liveKitRooms.get('primary'), not getPrimary(): the
// latter creates a Room when none exists, which would hide a missing primary.

// Tags the primary Room object so a later read can tell whether the client is
// still holding the same instance. 'absent' means the registry has no primary.
export const tagPrimaryRoom = (page: PlaywrightPage, tag: string): Promise<boolean> =>
  page.evaluate((t) => {
    const room = ((w: Window) =>
      (w as Window & { liveKitRooms?: { get: (k: string) => unknown } }).liveKitRooms?.get('primary'))(window) as
      | { bbbTestTag?: string }
      | undefined;
    if (!room) return false;
    room.bbbTestTag = t;
    return true;
  }, tag);

export const getPrimaryRoomTag = (page: PlaywrightPage): Promise<string> =>
  page.evaluate(() => {
    const room = ((w: Window) =>
      (w as Window & { liveKitRooms?: { get: (k: string) => unknown } }).liveKitRooms?.get('primary'))(window) as
      | { bbbTestTag?: string }
      | undefined;
    return room ? (room.bbbTestTag ?? 'untagged') : 'absent';
  });

export interface RoomOptionsState {
  sharedWithLocalParticipant: boolean;
  stopLocalTrackOnUnpublish: boolean | undefined;
  dynacast: boolean | undefined;
}

// What livekit-client's LocalParticipant will actually use, as opposed to
// what room.options says.
export const getRoomOptionsState = (page: PlaywrightPage): Promise<RoomOptionsState | null> =>
  page.evaluate(() => {
    const room = ((w: Window) =>
      (w as Window & { liveKitRooms?: { get: (k: string) => unknown } }).liveKitRooms?.get('primary'))(window) as
      | RoomHandle
      | undefined;
    if (!room) return null;
    return {
      sharedWithLocalParticipant: room.localParticipant.roomOptions === room.options,
      stopLocalTrackOnUnpublish: room.localParticipant.roomOptions.stopLocalTrackOnUnpublish,
      dynacast: room.localParticipant.roomOptions.dynacast,
    };
  });

export interface LocalCameraState {
  publications: number;
  trackSids: string[];
}

export const getLocalCameraState = (page: PlaywrightPage): Promise<LocalCameraState> =>
  page.evaluate(() => {
    const room = ((w: Window) =>
      (w as Window & { liveKitRooms?: { get: (k: string) => unknown } }).liveKitRooms?.get('primary'))(window) as
      | RoomHandle
      | undefined;
    if (!room) return { publications: 0, trackSids: [] };
    const cams = Array.from(room.localParticipant.videoTrackPublications.values()).filter(
      (pub) => pub.source === 'camera',
    );
    return {
      publications: cams.length,
      trackSids: cams.map((pub) => pub.trackSid).filter((sid): sid is string => !!sid),
    };
  });

// Identities whose camera this page is subscribed to with a live track.
export const getLiveCameraIdentities = (page: PlaywrightPage): Promise<string[]> =>
  page.evaluate(() => {
    const room = ((w: Window) =>
      (w as Window & { liveKitRooms?: { get: (k: string) => unknown } }).liveKitRooms?.get('primary'))(window) as
      | RoomHandle
      | undefined;
    if (!room) return [];
    return Array.from(room.remoteParticipants.values())
      .filter((participant) =>
        Array.from(participant.videoTrackPublications.values()).some(
          (pub) => pub.source === 'camera' && pub.isSubscribed && pub.track?.mediaStreamTrack?.readyState === 'live',
        ),
      )
      .map((participant) => participant.identity);
  });

export interface MicUiSample {
  atMs: number;
  showsMuted: boolean;
  showsUnmuted: boolean;
  trackUnmuted: boolean;
}

// Samples the mic button against the local publication. The mismatch under
// test is transient (a reconnect window), so an end-state check cannot see it.
export const startMicUiWatch = (page: PlaywrightPage, intervalMs = 250): Promise<void> =>
  page.evaluate(
    ({ interval, mutedSelector, unmutedSelector }) => {
      const w = window as TestWindow & {
        bbbMicUiSamples?: MicUiSample[];
        bbbMicUiTimer?: ReturnType<typeof setInterval>;
      };

      if (w.bbbMicUiTimer) clearInterval(w.bbbMicUiTimer);
      w.bbbMicUiSamples = [];
      w.bbbMicUiTimer = setInterval(() => {
        const room = w.liveKitRoom;
        const pubs = room
          ? Array.from(room.localParticipant.audioTrackPublications.values()).filter(
              (pub) => pub.source === 'microphone',
            )
          : [];

        w.bbbMicUiSamples?.push({
          atMs: Date.now(),
          showsMuted: !!document.querySelector(mutedSelector),
          showsUnmuted: !!document.querySelector(unmutedSelector),
          trackUnmuted: pubs.length > 0 && pubs.some((pub) => !pub.isMuted),
        });
      }, interval);
    },
    { interval: intervalMs, mutedSelector: e.unmuteMicButton, unmutedSelector: e.muteMicButton },
  );

// Samples the room's connection state so a test can prove the session was
// interrupted, not only that it is fine afterwards.
export const startRoomStateWatch = (page: PlaywrightPage, intervalMs = 250): Promise<void> =>
  page.evaluate((interval) => {
    const w = window as TestWindow & {
      bbbRoomStateSamples?: string[];
      bbbRoomStateTimer?: ReturnType<typeof setInterval>;
    };

    if (w.bbbRoomStateTimer) clearInterval(w.bbbRoomStateTimer);
    w.bbbRoomStateSamples = [];
    w.bbbRoomStateTimer = setInterval(() => {
      w.bbbRoomStateSamples?.push(w.liveKitRoom?.state ?? 'absent');
    }, interval);
  }, intervalMs);

export const stopRoomStateWatch = (page: PlaywrightPage): Promise<string[]> =>
  page.evaluate(() => {
    const w = window as TestWindow & {
      bbbRoomStateSamples?: string[];
      bbbRoomStateTimer?: ReturnType<typeof setInterval>;
    };

    if (w.bbbRoomStateTimer) clearInterval(w.bbbRoomStateTimer);
    w.bbbRoomStateTimer = undefined;

    return w.bbbRoomStateSamples ?? [];
  });

export const stopMicUiWatch = (page: PlaywrightPage): Promise<MicUiSample[]> =>
  page.evaluate(() => {
    const w = window as TestWindow & {
      bbbMicUiSamples?: MicUiSample[];
      bbbMicUiTimer?: ReturnType<typeof setInterval>;
    };

    if (w.bbbMicUiTimer) clearInterval(w.bbbMicUiTimer);
    w.bbbMicUiTimer = undefined;

    return w.bbbMicUiSamples ?? [];
  });

// Waits out an SDK reconnect: the room leaves Connected first (a resume can
// be over in milliseconds, so that phase is best effort) and comes back to
// Connected once the session is up. Callers poll the record afterwards.
export const waitForRoomReconnected = async (page: PlaywrightPage): Promise<void> => {
  try {
    await expect(async () => {
      expect((await getLocalMicState(page)).roomState).not.toBe('connected');
    }).toPass({ timeout: ELEMENT_WAIT_TIME });
  } catch {
    // Already back, or never observed leaving: fall through to the connected wait.
  }
  await expect(async () => {
    expect((await getLocalMicState(page)).roomState, 'the LiveKit room should reconnect').toBe('connected');
  }).toPass({ timeout: RECONNECT_WAIT_TIME });
};

// Makes the SDK's publishTrack call through and then reject. That is the state
// doPublish's catch block exists for - the track reached the room but the call
// the bridge awaited did not resolve - and it is what a publish racing the
// SDK's own republish produces. Returns false if the room is not exposed.
export const failPublishAfterItLands = (page: PlaywrightPage): Promise<boolean> =>
  page.evaluate(() => {
    const w = window as TestWindow & { bbbPublishesLanded?: number };
    const participant = w.liveKitRoom?.localParticipant as
      | { publishTrack: (track: unknown, options: unknown) => Promise<unknown> }
      | undefined;

    if (!participant) return false;

    const original = participant.publishTrack.bind(participant);
    w.bbbPublishesLanded = 0;
    participant.publishTrack = async (track: unknown, options: unknown) => {
      await original(track, options);
      w.bbbPublishesLanded = (w.bbbPublishesLanded ?? 0) + 1;

      throw new Error('publish rejected after the track landed');
    };

    return true;
  });

export const getLandedPublishCount = (page: PlaywrightPage): Promise<number> =>
  page.evaluate(() => (window as TestWindow & { bbbPublishesLanded?: number }).bbbPublishesLanded ?? 0);

export interface MediaOutageObservation {
  mediaConnected: boolean;
  showsOpenMic: boolean;
  showsMutedMic: boolean;
  micPublications: number;
  toldTheUser: boolean;
}

// The three facts a media outage has to be judged on together: whether the
// media session is up, whether the UI still offers an open microphone, and
// whether anything at all told the user. Any one of them being different makes
// the outage defensible; all three at once is the silent-open-mic failure.
export const observeMediaOutage = async (page: PlaywrightPage): Promise<MediaOutageObservation> => {
  const local = await getLocalMicState(page).catch(() => null);
  const toasts = await page.locator(e.smallToastMsg).allTextContents();

  return {
    mediaConnected: local?.roomState === 'connected',
    showsOpenMic: (await page.locator(e.muteMicButton).count()) > 0,
    showsMutedMic: (await page.locator(e.unmuteMicButton).count()) > 0,
    micPublications: local?.micPublications ?? 0,
    toldTheUser:
      (await page.locator(e.notificationBannerBar).count()) > 0 || toasts.some((text) => text.trim().length > 0),
  };
};

// Waits until the LiveKit session is demonstrably interrupted. Without this a
// case could assert against an outage that never reached the media path.
export const waitForMediaInterrupted = async (page: PlaywrightPage): Promise<string> => {
  let observed = 'connected';
  await expect(async () => {
    observed = (await getLocalMicState(page)).roomState;
    expect(observed, 'the outage should interrupt the LiveKit session').not.toBe('connected');
  }).toPass({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME * 2 });

  return observed;
};

// Samples the media-outage facts from the test side for the length of an
// outage. A single end-of-outage read is not enough: the client moves through
// phases (signalReconnecting with the mic still shown, then dropped out of
// audio entirely), so whether the bad combination is visible depends on when
// you look.
export const sampleMediaOutage = async (
  page: PlaywrightPage,
  durationMs: number,
  intervalMs = 2_000,
): Promise<MediaOutageObservation[]> => {
  const samples: MediaOutageObservation[] = [];
  const rounds = Math.max(1, Math.floor(durationMs / intervalMs));

  for (let i = 0; i < rounds; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(intervalMs);
    // eslint-disable-next-line no-await-in-loop
    samples.push(await observeMediaOutage(page));
  }

  return samples;
};

export interface VoiceClaimSample {
  mediaConnected: boolean;
  rowPresent: boolean;
  talking: boolean;
  muted: boolean;
}

// Pairs the viewer's own media state with what the server records about them,
// so a case can assert on the disagreement rather than on either side alone.
export const sampleVoiceClaims = async (
  viewer: PlaywrightPage,
  moderator: PlaywrightPage,
  viewerUserId: string,
  durationMs: number,
  intervalMs = 2_000,
): Promise<VoiceClaimSample[]> => {
  const samples: VoiceClaimSample[] = [];
  const rounds = Math.max(1, Math.floor(durationMs / intervalMs));

  for (let i = 0; i < rounds; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await viewer.waitForTimeout(intervalMs);
    // eslint-disable-next-line no-await-in-loop
    const local = await getLocalMicState(viewer).catch(() => null);
    // eslint-disable-next-line no-await-in-loop
    const row = (await getUserVoiceRows(moderator).catch(() => [])).find((r) => r.userId === viewerUserId);
    samples.push({
      mediaConnected: local?.roomState === 'connected',
      rowPresent: !!row,
      talking: row?.talking === true,
      muted: row?.muted === true,
    });
  }

  return samples;
};

export const simulateRoomScenario = (page: PlaywrightPage, scenario: string): Promise<void> =>
  page.evaluate(async (s) => {
    const room = (window as TestWindow).liveKitRoom;
    if (!room) throw new Error('window.liveKitRoom is not exposed');
    await room.simulateScenario(s);
  }, scenario);

export interface ReconnectionFixture {
  audio: Audio;
  modPage: Page;
  viewerPage: Page;
  viewerUserId: string;
  // Console log codes seen on the viewer page (from clientLogger objects).
  viewerLogCodes: string[];
  // The raw console text behind those codes. A logCode says which branch ran;
  // the text carries the error message, which is what some cases assert on.
  viewerLogLines: string[];
  cutGraphql: () => Promise<void>;
  restoreGraphql: () => void;
  // Resolves once the client logs its GraphQL connection status back to
  // connected (logCode stats_connection_state) after the last cut. The
  // reconnection banner is not a usable signal: it lags the cut and clears
  // before the retry lands.
  waitForGraphqlReconnected: (timeout: number) => Promise<void>;
  // Freezes the LiveKit signal socket both ways without closing it.
  stallLiveKitSignal: () => void;
  // Closes the stalled socket from the server side and lifts the stall.
  dropLiveKitSignal: () => Promise<void>;
  // Refuses every LiveKit signal socket, including the ones a reconnect opens,
  // so the SDK's retries and the room's own retry effect both fail. GraphQL is
  // left alone, which is what separates a media outage from a network outage.
  cutLiveKitSignal: () => Promise<void>;
  restoreLiveKitSignal: () => void;
}

// Moderator (server-state probe + audio witness) and a viewer publishing an
// unmuted mic, in separate contexts so offline emulation can target the viewer.
// The viewer's GraphQL and LiveKit signal sockets are proxied so a spec can cut,
// stall or drop them without touching the moderator.
export const initReconnectionScenario = async (
  browser: Browser,
  testInfo: TestInfo,
  options: { webcam?: boolean } = {},
): Promise<ReconnectionFixture> => {
  const modContext = await browser.newContext();
  const audio = new Audio(browser, modContext);
  const modRawPage = await modContext.newPage();
  await exposeLiveKitRoom(modRawPage);
  await audio.initModPage(modRawPage, { testInfo, createModules: APOLLO_CLIENT_SETTINGS_MODULE });
  const { modPage } = audio;
  // A skip here would take the whole matrix with it and report green; the
  // server-state probe is a requirement of every case.
  expect(await isApolloClientExposed(modPage.page, ELEMENT_WAIT_TIME), APOLLO_EXPOSURE_SKIP_REASON).toBe(true);

  const viewerContext = await browser.newContext();
  const viewerRawPage = await viewerContext.newPage();
  await exposeLiveKitRoom(viewerRawPage);

  const viewerLogCodes: string[] = [];
  const viewerLogLines: string[] = [];
  viewerRawPage.on('console', (msg) => {
    const text = msg.text();
    const code = /logCode: ([A-Za-z0-9_]+)/.exec(text)?.[1];
    if (code) viewerLogCodes.push(code);
    viewerLogLines.push(text);
  });
  let cutAtLine = 0;

  let blockGraphql = false;
  const liveGraphqlSockets = new Set<WebSocketRoute>();
  await viewerRawPage.routeWebSocket('**/graphql', (ws) => {
    if (blockGraphql) {
      ws.close();
      return;
    }
    const server = ws.connectToServer();
    liveGraphqlSockets.add(ws);
    // A close handler disables Playwright's default close forwarding, so the
    // cut has to be forwarded by hand or the server never sees it.
    ws.onClose((code, reason) => {
      liveGraphqlSockets.delete(ws);
      server.close({ code, reason });
    });
    server.onClose((code, reason) => {
      liveGraphqlSockets.delete(ws);
      ws.close({ code, reason });
    });
  });

  let stallSignal = false;
  let blockSignal = false;
  const liveSignalSockets = new Set<WebSocketRoute>();
  await viewerRawPage.routeWebSocket(/\/livekit\/rtc/, (ws) => {
    if (blockSignal) {
      ws.close();
      return;
    }
    const server = ws.connectToServer();
    liveSignalSockets.add(ws);
    ws.onMessage((message) => {
      if (!stallSignal) server.send(message);
    });
    server.onMessage((message) => {
      if (!stallSignal) ws.send(message);
    });
    ws.onClose((code, reason) => {
      liveSignalSockets.delete(ws);
      server.close({ code, reason });
    });
    server.onClose((code, reason) => {
      liveSignalSockets.delete(ws);
      ws.close({ code, reason });
    });
  });

  const viewerPage = new Page(browser, viewerRawPage, testInfo);
  await viewerPage.init(false, { fullName: VIEWER_NAME, meetingId: modPage.meetingId, testInfo });
  audio.userPage = viewerPage;

  await modPage.waitAndClick(e.joinAudio);
  await connectMicrophone(modPage);
  await viewerPage.waitAndClick(e.joinAudio);
  await connectMicrophone(viewerPage);
  await ensureUnmuted(viewerPage);
  if (options.webcam) await viewerPage.shareWebcam();

  const viewerUserId = await getOwnUserId(viewerPage.page);

  return {
    audio,
    modPage,
    viewerPage,
    viewerUserId,
    viewerLogCodes,
    viewerLogLines,
    cutGraphql: async () => {
      blockGraphql = true;
      cutAtLine = viewerLogLines.length;
      await Promise.all([...liveGraphqlSockets].map((ws) => ws.close()));
    },
    restoreGraphql: () => {
      blockGraphql = false;
    },
    waitForGraphqlReconnected: async (timeout: number) => {
      await expect(async () => {
        const reconnected = viewerLogLines
          .slice(cutAtLine)
          .some((line) => line.includes('stats_connection_state') && line.includes('connected=true'));
        expect(reconnected, 'the client should re-establish its GraphQL connection').toBe(true);
      }).toPass({ timeout });
    },
    stallLiveKitSignal: () => {
      stallSignal = true;
    },
    dropLiveKitSignal: async () => {
      await Promise.all([...liveSignalSockets].map((ws) => ws.close()));
      stallSignal = false;
    },
    cutLiveKitSignal: async () => {
      blockSignal = true;
      await Promise.all([...liveSignalSockets].map((ws) => ws.close()));
    },
    restoreLiveKitSignal: () => {
      blockSignal = false;
    },
  };
};

// Publications and subscriptions are signalled state; the packet count on
// the moderator's receiver is what proves audio is arriving.
const viewerPacketsAtModerator = async (fixture: ReconnectionFixture): Promise<number> =>
  (await getRemoteAudioStates(fixture.modPage.page)).find((state) => state.identity === fixture.viewerUserId)
    ?.packetsReceived ?? 0;

export const expectViewerAudioFlowing = async (fixture: ReconnectionFixture): Promise<void> => {
  const { modPage, viewerPage, viewerUserId } = fixture;
  await expect(async () => {
    const local = await getLocalMicState(viewerPage.page);
    expect(local.roomState, 'the viewer should be connected to the LiveKit room').toBe('connected');
    expect(local.micPublications, 'the viewer should publish a microphone track').toBeGreaterThan(0);
    expect(local.allMuted, 'the viewer should be unmuted').toBe(false);
    expect(await getAudioPublisherIdentities(modPage.page), 'the moderator should receive the viewer audio').toContain(
      viewerUserId,
    );
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
  await expect(async () => {
    const before = await viewerPacketsAtModerator(fixture);
    await modPage.page.waitForTimeout(AUDIO_SAMPLE_WINDOW);
    expect(
      await viewerPacketsAtModerator(fixture),
      'the moderator should receive audio packets from the viewer',
    ).toBeGreaterThan(before);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

export const expectViewerSilent = async (fixture: ReconnectionFixture, message: string): Promise<void> => {
  const { modPage, viewerPage, viewerUserId } = fixture;
  await expect(async () => {
    const local = await getLocalMicState(viewerPage.page);
    expect(local.allMuted, message).toBe(true);
    expect(await getAudioPublisherIdentities(modPage.page), message).not.toContain(viewerUserId);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

// The mic button reflects the voice record; the publication is what the room
// carries. The regressions under test all end with the two disagreeing.
export const expectMicUiMatchesPublication = async (fixture: ReconnectionFixture): Promise<void> => {
  const { viewerPage } = fixture;
  await expect(async () => {
    const showsUnmuted = await viewerPage.checkElement(e.muteMicButton);
    const showsMuted = await viewerPage.checkElement(e.unmuteMicButton);
    expect(showsUnmuted || showsMuted, 'the viewer should still be in audio').toBe(true);
    const local = await getLocalMicState(viewerPage.page);
    if (showsUnmuted) {
      expect(local.micPublications, 'a mic shown as open should be published').toBeGreaterThan(0);
      expect(local.allMuted, 'a mic shown as open should not be muted').toBe(false);
    } else {
      expect(local.allMuted, 'a mic shown as muted should not be sending').toBe(true);
    }
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

export const ejectViewerByUserLeftSweep = async (fixture: ReconnectionFixture): Promise<void> => {
  const { modPage, viewerUserId } = fixture;
  await fixture.cutGraphql();
  await expectUserRemoved(
    modPage.page,
    viewerUserId,
    'should drop the viewer from the meeting once the user-left flag expires',
    PASSIVE_REMOVAL_WAIT_TIME,
  );
};

export const expectViewerRejoined = async (fixture: ReconnectionFixture): Promise<void> => {
  const { modPage, viewerPage, viewerUserId } = fixture;
  await expect(async () => {
    expect(await getMeetingUserIds(modPage.page), 'the viewer should be re-admitted once GraphQL recovers').toContain(
      viewerUserId,
    );
  }).toPass({ timeout: REJOIN_WAIT_TIME });
  await expect(async () => {
    const rows = await getLiveKitMembershipRows(viewerPage.page);
    expect(
      rows.some((row) => row.purpose === 'primary' && row.hasToken),
      'the viewer should hold a primary membership again',
    ).toBe(true);
  }).toPass({ timeout: REJOIN_WAIT_TIME });
  await expect(async () => {
    const local = await getLocalMicState(viewerPage.page);
    expect(local.roomState, 'the viewer LiveKit room should reconnect after the rejoin').toBe('connected');
    expect(local.canPublish, 'the rejoined viewer should have publish rights').toBe(true);
  }).toPass({ timeout: REJOIN_WAIT_TIME });
};

export const muteViewer = async (fixture: ReconnectionFixture): Promise<void> => {
  const { viewerPage } = fixture;
  await viewerPage.waitAndClick(e.muteMicButton);
  await viewerPage.hasElement(e.unmuteMicButton, 'should show the unmute button after muting');
};

export const unmuteViewer = async (fixture: ReconnectionFixture): Promise<void> => {
  const { viewerPage } = fixture;
  await viewerPage.waitAndClick(e.unmuteMicButton);
  await viewerPage.hasElement(e.muteMicButton, 'should show the mute button after unmuting');
};
