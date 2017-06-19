import { check } from 'meteor/check';
import Captions from '/imports/api/1.1/captions';
import Logger from '/imports/startup/server/logger';

export default function addCaption(meetingId, locale, captionHistory, id = false) {
  check(meetingId, String);
  check(locale, String);
  check(captionHistory, Object);

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
      'captionHistory.locale': locale,
      'captionHistory.ownerId': captionHistory.ownerId,
      'captionHistory.captions': captionHistory.captions,
      'captionHistory.next': captionHistory.next,
      'captionHistory.index': captionHistory.index,
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

    if (numChanged) {
      return Logger.verbose(`Upserted caption locale=${locale} meeting=${meetingId}`);
    }
  };

  return Captions.upsert(selector, modifier, cb);
}
