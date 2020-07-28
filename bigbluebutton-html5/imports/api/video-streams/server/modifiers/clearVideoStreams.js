import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';

export default function clearVideoStreams(meetingId) {
  if (meetingId) {
    return VideoStreams.remove({ meetingId }, () => {
      Logger.info(`Cleared VideoStreams in (${meetingId})`);
    });
  }

  return VideoStreams.remove({}, () => {
    Logger.info('Cleared VideoStreams in all meetings');
  });
}
