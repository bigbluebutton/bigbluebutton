import Captions from '/imports/api/1.1/captions';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import addCaption from '../modifiers/addCaption';

export default function handleCaptionOwnerUpdate({ payload }) {
  const meetingId = payload.meeting_id;
  const locale = payload.locale;
  const ownerId = payload.owner_id;

  check(meetingId, String);
  check(locale, String);
  check(ownerId, String);

  const selector = {
    meetingId,
    locale,
  };

  const modifier = {
    $set: {
      'captionHistory.ownerId': ownerId,
    },
  };

  const Caption = Captions.findOne(selector);

  if (!Caption) {
    const captionHistory = {
      ownerId,
      captions: '',
      index: 0,
      next: null,
    };

    return addCaption(meetingId, locale, captionHistory);
  }

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating captions owner: ${err}`);
    }

    if (numChanged) {
      return Logger.verbose(`Update caption owner locale=${locale} meeting=${meetingId}`);
    }
  };

  return Captions.update(selector, modifier, { multi: true }, cb);
}
