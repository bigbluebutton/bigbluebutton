import {
  Room,
  Track,
  type LocalTrackPublication,
  type TrackPublication,
  type RemoteTrack,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';

export const LK_FATAL_ERROR_EVENT = 'liveKitFatalError';

export const liveKitRoom: Room = new Room();

// Expose the main room instance for E2E testing, but only when a test
// explicitly opts in before load (via Playwright's addInitScript with
// BBB_EXPOSE_LIVEKIT_ROOM set to true).
declare global {
  interface Window {
    liveKitRoom?: Room;
    BBB_EXPOSE_LIVEKIT_ROOM?: boolean;
  }
}

if (typeof window !== 'undefined' && window.BBB_EXPOSE_LIVEKIT_ROOM) {
  window.liveKitRoom = liveKitRoom;
}

export const lkIsCameraSource = (track: TrackPublication | RemoteTrack): boolean => {
  return track.kind === Track.Kind.Video && track.source === Track.Source.Camera;
};

export const isLiveKitBridge = (bridgeName: string): boolean => {
  return bridgeName === 'livekit';
};

export const lkToggleMuteCameras = (mute: boolean): void => {
  const localParticipant = liveKitRoom?.localParticipant;

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

export default {
  LK_FATAL_ERROR_EVENT,
  lkIsCameraSource,
  liveKitRoom,
  lkToggleMuteCameras,
};
