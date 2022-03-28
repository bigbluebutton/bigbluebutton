import { check } from 'meteor/check';
import sendAnnotationHelper from './sendAnnotationHelper';
import sendEraserHelper from './sendEraserHelper';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

const ANNOTATION_TYPE_ERASER = 'eraser';

export default function sendAnnotation(annotation) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    if (annotation.type === ANNOTATION_TYPE_ERASER) {
      sendEraserHelper(annotation, meetingId, requesterUserId);
    } else {
      sendAnnotationHelper(annotation, meetingId, requesterUserId);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method sendAnnotation ${err.stack}`);
  }
}
