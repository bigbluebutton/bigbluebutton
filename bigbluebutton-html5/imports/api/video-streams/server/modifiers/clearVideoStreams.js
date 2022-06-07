import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';

export default function clearVideoStreams(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = VideoStreams.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared VideoStreams in (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing VideoStreams (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = VideoStreams.remove({});

      if (numberAffected) {
        Logger.info('Cleared VideoStreams in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing VideoStreams (all). ${err}`);
    }
  }
}
