import { extractCredentials } from '/imports/api/common/server/helpers';
import sendAnnotationHelper from './sendAnnotationHelper';

export default function sendBulkAnnotations(payload) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  payload.forEach(annotation => sendAnnotationHelper(annotation, meetingId, requesterUserId));
}
