import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setAutoTranslation from '/imports/api/captions/server/modifiers/setAutoTranslation';

export default function toggleAutoTranslation(locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(locale, String);
    check(meetingId, String);
    check(requesterUserId, String);

    const caption = Captions.findOne({ meetingId, locale }, { fields: { autoTranslation:1 } });
    setAutoTranslation(meetingId, locale, !caption.autoTranslation);
  } catch (err) {
    Logger.error(`Exception while invoking method toggleAutoTranslation ${err.stack}`);
  }
}
