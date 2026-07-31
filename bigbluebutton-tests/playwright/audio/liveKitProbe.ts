import { type Page as PlaywrightPage } from '@playwright/test';

// Passed into page.evaluate rather than closed over: those callbacks are
// serialized and run in the browser, where this module's scope does not exist.
const LK_NOT_EXPOSED_ERR_MSG = 'window.liveKitRoom is not exposed';

// Reads the page's own LiveKit Room through window.liveKitRoom, which the client
// only publishes when BBB_EXPOSE_LIVEKIT_ROOM (same as other specs like muteReinforcement)

export interface TestPublication {
  source: string;
  isMuted: boolean;
  trackSid?: string;
}

export interface TestRemotePublication extends TestPublication {
  isSubscribed: boolean;
  track?: { mediaStreamTrack?: MediaStreamTrack; receiver?: RTCRtpReceiver };
}

export interface TestRemoteParticipant {
  identity: string;
  audioTrackPublications: Map<string, TestRemotePublication>;
}

export interface TestRoom {
  state: string;
  localParticipant: {
    audioTrackPublications: Map<string, TestPublication>;
    setMicrophoneEnabled: (enabled: boolean) => Promise<unknown>;
    permissions?: { canPublish: boolean; canSubscribe: boolean };
  };
  remoteParticipants: Map<string, TestRemoteParticipant>;
  simulateScenario: (scenario: string) => Promise<void>;
  disconnect: (stopTracks?: boolean) => Promise<void>;
}

export type TestWindow = Window & {
  BBB_EXPOSE_LIVEKIT_ROOM?: boolean;
  liveKitRoom?: TestRoom;
  BBB_TEST_LK_CREDENTIALS?: { url: string; token: string };
};

// Sets the opt-in room expose flag, then wraps Room.connect to capture the (url, token) the
// client connects with. To be used for reconnect tests (see reconnectWithExistingToken).
export const exposeLiveKitRoom = (page: PlaywrightPage): Promise<void> =>
  page.addInitScript(() => {
    const w = window as TestWindow & { bbbLkConnectWrapped?: boolean };

    w.BBB_EXPOSE_LIVEKIT_ROOM = true;

    const wrap = setInterval(() => {
      const room = w.liveKitRoom as (TestRoom & { connect?: unknown }) | undefined;

      if (!room || w.bbbLkConnectWrapped) return;

      w.bbbLkConnectWrapped = true;

      const original = (room.connect as (url: string, token: string, opts?: unknown) => Promise<void>).bind(room);

      (room as { connect: unknown }).connect = (url: string, token: string, opts?: unknown) => {
        w.BBB_TEST_LK_CREDENTIALS = { url, token };
        return original(url, token, opts);
      };

      clearInterval(wrap);
    }, 50);
  });

// Re-enters the LK room with the credentials the client already used.
export const reconnectWithExistingToken = (page: PlaywrightPage): Promise<void> =>
  page.evaluate(async (notExposed) => {
    const w = window as TestWindow;
    const room = w.liveKitRoom as (TestRoom & { connect: (u: string, t: string) => Promise<void> }) | undefined;

    if (!room) throw new Error(notExposed);

    if (!w.BBB_TEST_LK_CREDENTIALS) throw new Error('no LiveKit credentials were captured');

    await room.connect(w.BBB_TEST_LK_CREDENTIALS.url, w.BBB_TEST_LK_CREDENTIALS.token);
  }, LK_NOT_EXPOSED_ERR_MSG);

export interface LocalMicState {
  roomState: string;
  micPublications: number;
  allMuted: boolean;
  canPublish: boolean;
  canSubscribe: boolean;
}

export const getLocalMicState = (page: PlaywrightPage): Promise<LocalMicState> =>
  page.evaluate((notExposed) => {
    const room = (window as TestWindow).liveKitRoom;

    if (!room) throw new Error(notExposed);

    const pubs = Array.from(room.localParticipant.audioTrackPublications.values()).filter(
      (pub) => pub.source === 'microphone',
    );

    return {
      roomState: room.state,
      micPublications: pubs.length,
      allMuted: pubs.length === 0 || pubs.every((pub) => pub.isMuted),
      canPublish: room.localParticipant.permissions?.canPublish ?? false,
      canSubscribe: room.localParticipant.permissions?.canSubscribe ?? false,
    };
  }, LK_NOT_EXPOSED_ERR_MSG);

// Identities of LK users publishing an unmuted mic track. LiveKit identity == BBB intId for web users.
export const getAudioPublisherIdentities = (page: PlaywrightPage): Promise<string[]> =>
  page.evaluate((notExposed) => {
    const room = (window as TestWindow).liveKitRoom;

    if (!room) throw new Error(notExposed);

    return Array.from(room.remoteParticipants.values())
      .filter((participant) =>
        Array.from(participant.audioTrackPublications.values()).some(
          (pub) => pub.source === 'microphone' && !pub.isMuted,
        ),
      )
      .map((participant) => participant.identity);
  }, LK_NOT_EXPOSED_ERR_MSG);

export interface RemoteAudioState {
  identity: string;
  micPublications: number;
  unmuted: number;
  subscribed: number;
  liveTracks: number;
  packetsReceived: number;
}

// What this page could hear from each remote participant. The distinctions matter:
// remoteParticipants lists everyone whether subscribed or not, audioTrackPublications
// includes unsubscribed publications, and isMuted is only signalled state. Just
// packetsReceived proves audio is arriving.
export const getRemoteAudioStates = (page: PlaywrightPage): Promise<RemoteAudioState[]> =>
  page.evaluate(async (notExposed) => {
    const room = (window as TestWindow).liveKitRoom;

    if (!room) throw new Error(notExposed);

    return Promise.all(
      Array.from(room.remoteParticipants.values()).map(async (participant) => {
        const mics = Array.from(participant.audioTrackPublications.values()).filter(
          (pub) => pub.source === 'microphone',
        );

        let packetsReceived = 0;

        await Promise.all(
          mics.map(async (pub) => {
            const receiver = pub.track?.receiver;

            if (!receiver) return;

            const stats = await receiver.getStats();

            stats.forEach((report: { type: string; packetsReceived?: number }) => {
              if (report.type === 'inbound-rtp') packetsReceived += report.packetsReceived ?? 0;
            });
          }),
        );

        return {
          identity: participant.identity,
          micPublications: mics.length,
          unmuted: mics.filter((pub) => !pub.isMuted).length,
          subscribed: mics.filter((pub) => pub.isSubscribed).length,
          liveTracks: mics.filter((pub) => pub.track?.mediaStreamTrack?.readyState === 'live').length,
          packetsReceived,
        };
      }),
    );
  }, LK_NOT_EXPOSED_ERR_MSG);

// Suppresses client-side LK teardown, which funnels down to Room.disconnect().
// Emulates a tab that never acts on its own removal. False if the room is not exposed.
export const suppressRoomDisconnect = (page: PlaywrightPage): Promise<boolean> =>
  page.evaluate(() => {
    const room = (window as TestWindow).liveKitRoom;

    if (!room) return false;

    room.disconnect = async () => {};

    return true;
  });

// Publishes the mic straight through the LK SDK.
export const republishMicrophone = (page: PlaywrightPage): Promise<void> =>
  page.evaluate(async (notExposed) => {
    const room = (window as TestWindow).liveKitRoom;

    if (!room) throw new Error(notExposed);

    await room.localParticipant.setMicrophoneEnabled(true);
  }, LK_NOT_EXPOSED_ERR_MSG);

// Drops and re-establishes the LK session, making LiveKit emit a fresh
// participant_joined. Uses LK's own simulation mechanism for this (see SDK docs).
export const forceRoomReconnect = (page: PlaywrightPage): Promise<void> =>
  page.evaluate(async (notExposed) => {
    const room = (window as TestWindow).liveKitRoom;

    if (!room) throw new Error(notExposed);

    await room.simulateScenario('full-reconnect');
  }, LK_NOT_EXPOSED_ERR_MSG);
