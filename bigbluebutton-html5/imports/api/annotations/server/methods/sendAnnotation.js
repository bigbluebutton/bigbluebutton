import { check } from 'meteor/check';
import sendAnnotationHelper from './sendAnnotationHelper';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function sendAnnotation(annotation) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  sendAnnotationHelper(annotation, meetingId, requesterUserId);
}
