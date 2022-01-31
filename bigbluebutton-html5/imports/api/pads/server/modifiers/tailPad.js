import { check } from 'meteor/check';
import { PadsUpdates } from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

export default function tailPad(meetingId, externalId, tail) {
  try {
    check(meetingId, String);
    check(externalId, String);
    check(tail, String);

    const selector = {
      meetingId,
      externalId,
    };

    const modifier = {
      $set: {
        tail,
      },
    };

    PadsUpdates.upsert(selector, modifier);
    Logger.debug(`Added pad tail external=${externalId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Adding pad tail to the collection: ${err}`);
  }
}
