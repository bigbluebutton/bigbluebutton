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
