import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

export default function setDictation(meetingId, locale, dictating) {
  try {
    check(meetingId, String);
    check(locale, String);
    check(dictating, Boolean);

    const selector = {
      meetingId,
      locale,
    };

    const modifier = {
      $set: {
        dictating,
        transcript: '',
      },
    };

    const numberAffected = Captions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set captions=${locale} dictating=${dictating} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted captions=${locale} dictating=${dictating} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting captions dictation to the collection: ${err}`);
  }
}
