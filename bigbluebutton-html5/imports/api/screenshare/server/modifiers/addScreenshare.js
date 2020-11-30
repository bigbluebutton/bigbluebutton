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

  try {
    const { numberAffected } = Screenshare.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Upserted screenshare id=${body.screenshareConf}`);
    }
  } catch (err) {
    Logger.error(`Adding screenshare to collection: ${err}`);
  }
}
