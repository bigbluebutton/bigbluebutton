import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setDictation from '/imports/api/captions/server/modifiers/setDictation';

export default function stopDictation(locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(locale, String);

    const captions = Captions.findOne({
      meetingId,
      ownerId: requesterUserId,
      locale,
    });

    if (captions) setDictation(meetingId, locale, false);
  } catch (err) {
    Logger.error(`Exception while invoking method stopDictation ${err.stack}`);
  }
}
