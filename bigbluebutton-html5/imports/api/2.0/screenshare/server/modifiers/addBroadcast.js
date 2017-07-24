import { check } from 'meteor/check';
import flat from 'flat';
import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/2.0/screenshare';

export default function addBroadcast(meetingId, body) {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      meetingId,
      broadcast: flat(body),
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding broadcast to collection: ${err}`);
    }

    return Logger.info(`Upserted broadcast id=${body.screenshareConf}`);
  };

  return Screenshare.upsert(selector, modifier, cb);
}
