import { extractCredentials } from '/imports/api/common/server/helpers';
import sendAnnotationHelper from './sendAnnotationHelper';
import { check } from 'meteor/check';

export default function sendBulkAnnotations(payload) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  try {
    check(meetingId, String);
    check(requesterUserId, String);
  } catch (err) {
    return false;
  }

  payload.forEach(annotation => sendAnnotationHelper(annotation, meetingId, requesterUserId));
  return true;
}
