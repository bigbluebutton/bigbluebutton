import {
  Room,
  Track,
  type LocalTrackPublication,
  type TrackPublication,
  type RemoteTrack,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';

export const liveKitRoom: Room = new Room();

export const getLKStats = async (): Promise<Map<string, unknown>> => {
  const { localParticipant } = liveKitRoom;

  const statsMap: Map<string, unknown> = new Map();

  if (localParticipant?.engine?.pcManager?.publisher) {
    const senderStats = await localParticipant.engine.pcManager.publisher.getStats();
    senderStats.forEach((stat) => {
      statsMap.set(stat.id, stat);
    });
  }

  if (localParticipant?.engine?.pcManager?.subscriber) {
    const receiverStats = await localParticipant.engine.pcManager.subscriber.getStats();
    receiverStats.forEach((stat) => {
      statsMap.set(stat.id, stat);
    });
  }

  return statsMap;
};

export const lkIsCameraSource = (track: TrackPublication | RemoteTrack): boolean => {
  return track.kind === Track.Kind.Video && track.source === Track.Source.Camera;
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
  getLKStats,
  lkIsCameraSource,
  liveKitRoom,
  lkToggleMuteCameras,
};
