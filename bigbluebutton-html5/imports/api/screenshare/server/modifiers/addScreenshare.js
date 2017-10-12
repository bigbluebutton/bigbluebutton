import { check } from 'meteor/check';
import flat from 'flat';
import Logger from '/imports/startup/server/logger';
import Screenshare from '/imports/api/screenshare';

export default function addScreenshare(meetingId, body) {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      meetingId,
      screenshare: flat(body),
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Adding screenshare to collection: ${err}`);
    }

    return Logger.info(`Upserted screenshare id=${body.screenshareConf}`);
  };

  return Screenshare.upsert(selector, modifier, cb);
}
