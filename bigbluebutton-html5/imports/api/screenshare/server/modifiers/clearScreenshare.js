import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/screenshare';

export default function clearScreenshare(meetingId) {
  const cb = (err) => {
    if (err) {
      return Logger.error(`Clearing screenshare to collection: ${err}`);
    }

    return Logger.info(`Cleared screenshare meetingId=${meetingId}`);
  };

  if (meetingId) {
    return Screenshare.remove({ meetingId }, cb);
  }
  return Screenshare.remove({}, cb);
}
