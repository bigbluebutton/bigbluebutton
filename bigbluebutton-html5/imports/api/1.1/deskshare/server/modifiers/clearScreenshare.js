import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/2.0/screenshare';

export default function clearScreenshare(meetingId, screenshareConf) {
  if (meetingId && screenshareConf) {
    return Screenshare.remove({ meetingId, 'screenshare.screenshareConf': screenshareConf }, Logger.info(`Cleared Screenshare (${meetingId}) , (${screenshareConf})`));
  }

  return Screenshare.remove({}, Logger.info('Cleared Screenshare (all)'));
}
