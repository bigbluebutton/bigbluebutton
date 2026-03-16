export const MEDIA_BRIDGE = process.env.MEDIA_BRIDGE;
export const isLiveKit = MEDIA_BRIDGE === 'livekit';
export const isDefault = MEDIA_BRIDGE === 'default';

const LIVEKIT_CREATE_PARAMS = 'audioBridge=livekit&cameraBridge=livekit&screenShareBridge=livekit';
const DEFAULT_CREATE_PARAMS = 'audioBridge=bbb-webrtc-sfu&cameraBridge=bbb-webrtc-sfu&screenShareBridge=bbb-webrtc-sfu';

export function getLiveKitCreateParam(): string | undefined {
  if (isDefault) return DEFAULT_CREATE_PARAMS;

  return isLiveKit ? LIVEKIT_CREATE_PARAMS : undefined;
}
