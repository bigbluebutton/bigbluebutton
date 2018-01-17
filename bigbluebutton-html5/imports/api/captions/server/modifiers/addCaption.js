import { Match, check } from 'meteor/check';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

export default function addCaption(meetingId, locale, captionHistory, id = false) {
  check(meetingId, String);
  check(locale, String);

  check(captionHistory, {
    ownerId: String,
    index: Number,
    captions: String,
    locale: Match.Maybe(String),
    localeCode: Match.Maybe(String),
    next: Match.OneOf(Number, undefined, null),
  });

  const selector = {
    meetingId,
    locale,
  };


  if (id) {
    selector._id = id;
  } else {
    selector['captionHistory.index'] = captionHistory.index;
  }

  const modifier = {
    $set: {
      meetingId,
      locale,
      captionHistory,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding caption to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.verbose(`Added caption locale=${locale} meeting=${meetingId}`);
    }

    return Logger.verbose(`Upserted caption locale=${locale} meeting=${meetingId}`);
  };

  return Captions.upsert(selector, modifier, cb);
}
