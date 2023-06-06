import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';

export default async function clearVideoStreams(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await VideoStreams.removeAsync({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared VideoStreams in (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing VideoStreams (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await VideoStreams.removeAsync({});

      if (numberAffected) {
        Logger.info('Cleared VideoStreams in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing VideoStreams (all). ${err}`);
    }
  }
}
