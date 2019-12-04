import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/screenshare';

export default function clearScreenshare(meetingId, screenshareConf) {
  const cb = (err) => {
    if (err) {
      return Logger.error(`removing screenshare to collection: ${err}`);
    }

    return Logger.info(`removed screenshare meetingId=${meetingId} id=${screenshareConf}`);
  };

  if (meetingId && screenshareConf) {
    return Screenshare.remove({ meetingId, 'screenshare.screenshareConf': screenshareConf }, cb);
  }
  return Screenshare.remove({}, cb);
}
