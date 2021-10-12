import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/screenshare';

export default function clearScreenshare(meetingId, screenshareConf) {
  try {
    let numberAffected;

    if (meetingId && screenshareConf) {
      numberAffected = Screenshare.remove({ meetingId, 'screenshare.screenshareConf': screenshareConf });
    } else if (meetingId) {
      numberAffected = Screenshare.remove({ meetingId });
    } else {
      numberAffected = Screenshare.remove({});
    }

    if (numberAffected) {
      Logger.info(`removed screenshare meetingId=${meetingId} id=${screenshareConf}`);
    }
  } catch (err) {
    Logger.error(`removing screenshare to collection: ${err}`);
  }
}
