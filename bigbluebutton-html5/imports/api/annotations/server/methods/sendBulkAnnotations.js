import { extractCredentials } from '/imports/api/common/server/helpers';
import sendAnnotationHelper from './sendAnnotationHelper';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function sendBulkAnnotations(payload) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  try {
    check(meetingId, String);
    check(requesterUserId, String);

    console.log("!!!!!!! sendBulkAnnotations!!!!:", payload)

    sendAnnotationHelper(payload, meetingId, requesterUserId);
    //payload.forEach((annotation) => sendAnnotationHelper(annotation, meetingId, requesterUserId));
    return true;
  } catch (err) {
    Logger.error(`Exception while invoking method sendBulkAnnotations ${err.stack}`);
    return false;
  }
}
