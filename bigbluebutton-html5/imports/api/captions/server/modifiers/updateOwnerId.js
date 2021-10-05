import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import updateOwner from '/imports/api/captions/server/methods/updateOwner';
import { check } from 'meteor/check';

export default function updateOwnerId(meetingId, userId, locale) {
  check(meetingId, String);
  check(userId, String);
  check(locale, String);

  const selector = {
    meetingId,
    locale,
  };

  const modifier = {
    $set: {
      ownerId: userId,
    },
  };

  try {
    const numberAffected = Captions.update(selector, modifier, { multi: true });

    if (numberAffected) {
      updateOwner(meetingId, userId, locale);
      Logger.verbose('Captions: updated caption', { locale, ownerId: userId });
    }
  } catch (err) {
    Logger.error('Captions: error while updating pad', { err });
  }
}
