export const MEDIA_BRIDGE = process.env.MEDIA_BRIDGE || 'default';
export const isLiveKit = MEDIA_BRIDGE === 'livekit';

const LIVEKIT_CREATE_PARAMS = 'audioBridge=livekit&cameraBridge=livekit&screenShareBridge=livekit';

export function getLiveKitCreateParam(): string | undefined {
  return isLiveKit ? LIVEKIT_CREATE_PARAMS : undefined;
}
