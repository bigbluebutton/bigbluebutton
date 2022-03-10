import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

export default function updateCaptionsOwner(meetingId, locale, ownerId) {
  try {
    check(meetingId, String);
    check(locale, String);
    check(ownerId, String);

    const selector = {
      meetingId,
      locale,
    };

    const modifier = {
      $set: {
        ownerId,
        dictating: false, // Refresh dictation mode
      },
    };

    const numberAffected = Captions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Added captions=${locale} owner=${ownerId} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted captions=${locale} owner=${ownerId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding captions owner to the collection: ${err}`);
  }
}
