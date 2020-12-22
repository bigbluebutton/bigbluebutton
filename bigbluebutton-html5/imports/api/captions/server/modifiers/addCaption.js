import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

export default function addCaption(meetingId, padId, locale) {
  check(meetingId, String);
  check(padId, String);
  check(locale, {
    locale: String,
    name: String,
  });

  const selector = {
    meetingId,
    padId,
  };

  const modifier = {
    meetingId,
    padId,
    locale,
    ownerId: '',
    readOnlyPadId: '',
    data: '',
    revs: 0,
    length: 0,
  };

  try {
    const { insertedId, numberAffected } = Captions.upsert(selector, modifier);

    if (insertedId) {
      Logger.verbose('Captions: added locale', { locale: locale.locale, meetingId });
    } else if (numberAffected) {
      Logger.verbose('Captions: upserted locale', { locale: locale.locale, meetingId });
    }
  } catch (err) {
    Logger.error(`Adding caption to collection: ${err}`);
  }
}
