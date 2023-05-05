import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

export default function createCaptions(meetingId, locale, name) {
  try {
    check(meetingId, String);
    check(locale, String);
    check(name, String);

    const selector = {
      meetingId,
      locale,
    };

    const modifier = {
      meetingId,
      locale,
      name,
      ownerId: '',
      dictating: false,
      transcript: '',
    };

    const numberAffected = Captions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Created captions=${locale} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Creating captions owner to the collection: ${err}`);
  }
}
