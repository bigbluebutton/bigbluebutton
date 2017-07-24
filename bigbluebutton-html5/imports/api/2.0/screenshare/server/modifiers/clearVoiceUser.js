import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/2.0/screenshare';

export default function clearVoiceUser(meetingId, screenshareConf, callerIdNum) {
  check(meetingId, String);
  check(callerIdNum, String);

  const selector = {
    meetingId,
    'broadcast.screenshareConf': screenshareConf,
  };

  const modifier = {
    $pull: {
      'broadcast.voiceUsers': { callerIdNum },
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Remove voiceUser to collection: ${err}`);
    }

    return Logger.info(`Remove voiceUser id=${callerIdNum}`);
  };

  return Screenshare.update(selector, modifier, cb);
}
