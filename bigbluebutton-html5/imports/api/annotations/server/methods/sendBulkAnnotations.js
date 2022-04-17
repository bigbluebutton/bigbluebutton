import { extractCredentials } from '/imports/api/common/server/helpers';
import sendAnnotationHelper from './sendAnnotationHelper';
import sendEraserHelper from './sendEraserHelper';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

const ANNOTATION_TYPE_ERASER = 'eraser';

export default function sendBulkAnnotations(payload) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  try {
    check(meetingId, String);
    check(requesterUserId, String);

    payload.forEach((annotation) => {
      if (annotation.annotationType === ANNOTATION_TYPE_ERASER) {
        sendEraserHelper(annotation, meetingId, requesterUserId);
      } else {
        sendAnnotationHelper(annotation, meetingId, requesterUserId);
      }
    });
    return true;
  } catch (err) {
    Logger.error(`Exception while invoking method sendBulkAnnotations ${err.stack}`);
    return false;
  }
}
