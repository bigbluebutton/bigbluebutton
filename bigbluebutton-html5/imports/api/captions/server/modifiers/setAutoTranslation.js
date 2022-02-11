import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setAutoTranslation(meetingId, locale, autoTranslation) {
  check(meetingId, String);
  check(locale, String);
  check(autoTranslation, Boolean);

  const selector = {
    meetingId,
    locale,
  };

  const modifier = {
    $set: {
      autoTranslation,
    }
  };

  try {
    const numberAffected = Captions.update(selector, modifier);

    if (numberAffected) {
      Logger.verbose('Captions: updated pad autoTranslation', { locale });
    }
  } catch (err) {
    Logger.error(`Updating captions pad autoTranslation: ${err}`);
  }
}
