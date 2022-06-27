import { check } from 'meteor/check';
import sendAnnotationHelper from './sendAnnotationHelper';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function sendAnnotations(annotations) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    sendAnnotationHelper(annotations, meetingId, requesterUserId);
  } catch (err) {
    Logger.error(`Exception while invoking method sendAnnotation ${err.stack}`);
  }
}
