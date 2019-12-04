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

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding caption to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.verbose(`Added caption locale=${locale.locale} meeting=${meetingId}`);
    }

    return Logger.verbose(`Upserted caption locale=${locale.locale} meeting=${meetingId}`);
  };

  return Captions.upsert(selector, modifier, cb);
}
