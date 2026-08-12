import {
  Track,
  type InternalRoomOptions,
  type Room,
  type LocalTrackPublication,
  type TrackPublication,
  type RemoteTrack,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';
import { liveKitRoomRegistry } from './registry';
import type { MembershipKey } from './registry';

export const LK_FATAL_ERROR_EVENT = 'liveKitFatalError';

export const DEFAULT_ROOM_OPTIONS: Partial<InternalRoomOptions> = {
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: false,
};

export interface LiveKitFatalErrorDetail {
  key: MembershipKey;
  source: string;
  error: Error;
}

// Expose the main room instance for E2E testing, but only when a test
// explicitly opts in before load (via Playwright's addInitScript with
// BBB_EXPOSE_LIVEKIT_ROOM set to true).
declare global {
  interface Window {
    liveKitRoom?: Room;
    liveKitRooms?: typeof liveKitRoomRegistry;
    BBB_EXPOSE_LIVEKIT_ROOM?: boolean;
  }
}

if (typeof window !== 'undefined' && window.BBB_EXPOSE_LIVEKIT_ROOM) {
  Object.defineProperty(window, 'liveKitRoom', {
    get: () => liveKitRoomRegistry.getPrimary(),
    configurable: true,
  });
  window.liveKitRooms = liveKitRoomRegistry;
}

export const lkIsCameraSource = (track: TrackPublication | RemoteTrack): boolean => {
  return track.kind === Track.Kind.Video && track.source === Track.Source.Camera;
};

export const isLiveKitBridge = (bridgeName: string): boolean => {
  return bridgeName === 'livekit';
};

export const lkToggleMuteCameras = (mute: boolean): void => {
  const room = liveKitRoomRegistry.getPrimary();
  const localParticipant = room?.localParticipant;

  if (!localParticipant?.videoTrackPublications || localParticipant.videoTrackPublications.size === 0) {
    return;
  }

  localParticipant.videoTrackPublications.forEach((publication: LocalTrackPublication) => {
    if (lkIsCameraSource(publication) && publication.isMuted !== mute) {
      if (mute) {
        publication.mute();
      } else {
        publication.unmute();
      }

      logger.info({
        logCode: 'livekit_camera_toggle_mute',
        extraInfo: {
          trackName: publication?.trackName,
          trackSid: publication?.trackSid,
          mute,
        },
      }, `LiveKit: camera track ${mute ? 'muted' : 'unmuted'} - ${publication?.trackSid}`);
    }
  });
};

export {
  liveKitRoomRegistry,
  PRIMARY_KEY,
  breakoutListenKey,
} from './registry';
export type { MembershipKey } from './registry';

export default {
  LK_FATAL_ERROR_EVENT,
  lkIsCameraSource,
  lkToggleMuteCameras,
};
