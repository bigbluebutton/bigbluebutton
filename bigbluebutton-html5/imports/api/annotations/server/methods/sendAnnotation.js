import sendAnnotationHelper from './sendAnnotationHelper';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function sendAnnotation(annotation) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  sendAnnotationHelper(annotation, meetingId, requesterUserId);
}
