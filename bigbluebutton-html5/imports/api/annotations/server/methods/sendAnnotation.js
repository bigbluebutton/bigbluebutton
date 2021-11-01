import { check } from 'meteor/check';
import sendAnnotationHelper from './sendAnnotationHelper';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function sendAnnotation(annotation) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    sendAnnotationHelper(annotation, meetingId, requesterUserId);
  } catch (err) {
    Logger.error(`Exception while invoking method sendAnnotation ${err.stack}`);
  }
}
