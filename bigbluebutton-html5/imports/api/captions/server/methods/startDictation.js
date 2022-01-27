import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setDictation from '/imports/api/captions/server/modifiers/setDictation';

export default function startDictation(locale) {
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

    if (captions) setDictation(meetingId, locale, true);
  } catch (err) {
    Logger.error(`Exception while invoking method startDictation ${err.stack}`);
  }
}
