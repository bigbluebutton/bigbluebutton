import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import clearErrorsModifier from '/imports/api/presentations/server/modifiers/clearErrors';

export default function clearErrors(podId) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(podId, String);

    clearErrorsModifier(meetingId, requesterUserId, podId);
  } catch (err) {
    Logger.error(`Exception while invoking method clearErrors ${err.stack}`);
  }
}
