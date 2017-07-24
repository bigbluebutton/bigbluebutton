import { check } from 'meteor/check';
import flat from 'flat';
import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/2.0/screenshare';

export default function addVoiceUser(meetingId, screenshareConf, body) {
  check(meetingId, String);
  check(screenshareConf, String);

  const selector = {
    meetingId,
    'broadcast.screenshareConf': screenshareConf,
  };

  const modifier = {
    $push: {
      'broadcast.voiceUsers': flat(body),
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding voiceUser to collection: ${err}`);
    }

    return Logger.info(`Upserted voiceUser id=${body.callerIdNum}, name=${body.callerIdName}`);
  };

  return Screenshare.upsert(selector, modifier, cb);
}
