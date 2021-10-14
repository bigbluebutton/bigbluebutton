import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import updateOwnerId from '/imports/api/captions/server/modifiers/updateOwnerId';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function takeOwnership(locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(locale, String);
    check(meetingId, String);
    check(requesterUserId, String);

    updateOwnerId(meetingId, requesterUserId, locale);
  } catch (err) {
    Logger.error(`Exception while invoking method takeOwnership ${err.stack}`);
  }
}
