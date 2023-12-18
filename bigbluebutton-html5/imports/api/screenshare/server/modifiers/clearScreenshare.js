import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/screenshare';

export default async function clearScreenshare(meetingId, screenshareConf) {
  try {
    let numberAffected;

    if (meetingId && screenshareConf) {
      numberAffected = await Screenshare.removeAsync({ meetingId, 'screenshare.screenshareConf': screenshareConf });
    } else if (meetingId) {
      numberAffected = await Screenshare.removeAsync({ meetingId });
    } else {
      numberAffected = await Screenshare.removeAsync({});
    }

    if (numberAffected) {
      Logger.info(`removed screenshare meetingId=${meetingId} id=${screenshareConf}`);
    }
  } catch (err) {
    Logger.error(`removing screenshare to collection: ${err}`);
  }
}
