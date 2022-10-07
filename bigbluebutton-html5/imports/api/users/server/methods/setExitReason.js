import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import setUserExitReason from '/imports/api/users/server/modifiers/setUserExitReason';

export default function setExitReason(reason) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    // Unauthenticated user, just ignore and go ahead.
    if (!meetingId || !requesterUserId) return;

    check(meetingId, String);
    check(requesterUserId, String);
    check(reason, String);

    setUserExitReason(meetingId, requesterUserId, reason);
  } catch (err) {
    Logger.error(`Exception while invoking method setExitReason ${err.stack}`);
  }
};
