import type { Page as PlaywrightPage } from '@playwright/test';

// In BigBlueButton 4.0 LiveKit is the default media bridge; bbb-webrtc-sfu is the
// legacy/secondary bridge. Tests therefore run with LiveKit unless MEDIA_BRIDGE
// explicitly selects bbb-webrtc-sfu.
// Valid MEDIA_BRIDGE values: 'livekit' (default) | 'bbb-webrtc-sfu'.
const VALID_MEDIA_BRIDGES = ['livekit', 'bbb-webrtc-sfu'] as const;
type MediaBridge = typeof VALID_MEDIA_BRIDGES[number];

export const MEDIA_BRIDGE = process.env.MEDIA_BRIDGE || 'livekit';
if (!VALID_MEDIA_BRIDGES.includes(MEDIA_BRIDGE as MediaBridge)) {
  throw new Error(
    `Invalid MEDIA_BRIDGE "${MEDIA_BRIDGE}". Valid values: ${VALID_MEDIA_BRIDGES.join(', ')}.`,
  );
}
export const isLegacy = MEDIA_BRIDGE === 'bbb-webrtc-sfu';
export const isLiveKit = !isLegacy;

const LEGACY_CREATE_PARAMS = 'audioBridge=bbb-webrtc-sfu&cameraBridge=bbb-webrtc-sfu&screenShareBridge=bbb-webrtc-sfu';

// LiveKit is the server-side default, so the default run needs no create
// parameters. The legacy run must override that default per meeting with
// explicit bbb-webrtc-sfu parameters.
export function getMediaBridgeCreateParam(): string | undefined {
  return isLegacy ? LEGACY_CREATE_PARAMS : undefined;
}

// Where the local microphone is published, per LiveKit room. Requires the room
// registry to be exposed, which only happens when a test opts in before load:
//   await page.addInitScript(() => { window.BBB_EXPOSE_LIVEKIT_ROOM = true; });
export interface RoomMicPlacement {
  name: string;
  primary: boolean;
  mics: number;
}

export const exposeLiveKitRooms = async (page: PlaywrightPage): Promise<void> =>
  page.addInitScript(() => {
    (window as unknown as { BBB_EXPOSE_LIVEKIT_ROOM: boolean }).BBB_EXPOSE_LIVEKIT_ROOM = true;
  });

export const getMicPlacement = async (page: PlaywrightPage): Promise<RoomMicPlacement[]> =>
  page.evaluate(() => {
    const w = window as unknown as {
      liveKitRooms?: {
        getPrimary: () => unknown;
        getRooms: () => Array<{
          name: string;
          localParticipant: { audioTrackPublications: Map<string, { source: string }> };
        }>;
      };
    };
    if (!w.liveKitRooms) throw new Error('window.liveKitRooms is not exposed - the test must opt in before load');
    const primary = w.liveKitRooms.getPrimary();

    return w.liveKitRooms.getRooms().map((room) => ({
      name: room.name,
      primary: room === primary,
      mics: Array.from(room.localParticipant.audioTrackPublications.values()).filter(
        (pub) => pub.source === 'microphone',
      ).length,
    }));
  });

// The LiveKit signal socket (/rtc, or /rtc/v1 on newer SDKs).
const LIVEKIT_SIGNAL_URL = /\/rtc(\/v1)?\?/;

export interface LiveKitSignalRoute {
  // Stops delivering the server's frames and close to every signal socket open
  // now; returns how many open sockets were held. Sockets opened afterwards (the
  // client's own reconnect) pass through untouched.
  hold: () => number;
}

export const routeLiveKitSignal = async (page: PlaywrightPage): Promise<LiveKitSignalRoute> => {
  // Routes the page's LiveKit signal sockets through Playwright so a test can
  // intercept and hold signaling messages. Must be installed before navigation.
  // E.g. use case.: Use the hold API in conjunction with dropLiveKitParticipant
  // to simulate a server-side participant drop.
  const sockets: Array<{ held: boolean; closed: boolean }> = [];

  await page.routeWebSocket(LIVEKIT_SIGNAL_URL, (ws) => {
    const socket = { held: false, closed: false };
    sockets.push(socket);
    const server = ws.connectToServer();

    ws.onMessage((message) => {
      try {
        server.send(message);
      } catch {
        // The server side is gone once the participant was closed; the client's
        // pings into it are expected to fail.
      }
    });
    server.onMessage((message) => {
      if (!socket.held) ws.send(message);
    });
    ws.onClose((code, reason) => {
      socket.closed = true;
      server.close({ code, reason });
    });
    server.onClose((code, reason) => {
      socket.closed = true;
      if (!socket.held) ws.close({ code, reason });
    });
  });

  return {
    hold: () => {
      const open = sockets.filter((socket) => !socket.closed);
      open.forEach((socket) => {
        // eslint-disable-next-line no-param-reassign
        socket.held = true;
      });
      return open.length;
    },
  };
};

export interface PrimaryRoomState {
  state: string;
  sid: string;
}

export const getPrimaryRoomState = async (page: PlaywrightPage): Promise<PrimaryRoomState> =>
  page.evaluate(() => {
    const w = window as unknown as {
      liveKitRooms?: { getPrimary: () => { state: string; localParticipant: { sid: string } } | undefined };
    };
    if (!w.liveKitRooms) throw new Error('window.liveKitRooms is not exposed - the test must opt in before load');
    const room = w.liveKitRooms.getPrimary();
    if (!room) throw new Error('no primary LiveKit room');

    return { state: room.state, sid: room.localParticipant.sid };
  });

export const dropLiveKitParticipant = async (page: PlaywrightPage): Promise<void> =>
  page.evaluate(async () => {
    const w = window as unknown as {
      liveKitRooms?: { getPrimary: () => { simulateScenario: (scenario: string) => Promise<void> } | undefined };
    };
    const room = w.liveKitRooms?.getPrimary();
    if (!room) throw new Error('no primary LiveKit room - window.liveKitRooms must be exposed before load');

    // Makes livekit-server close the page's primary participant the way it does on
    // NEGOTIATE_FAILED or JOIN_TIMEOUT: participant_left fires (and reaches akka as
    // LiveKitParticipantLeftEvtMsg), but no leave is sent to the client.
    await room.simulateScenario('node-failure');
  });
