import { extractCredentials } from '/imports/api/common/server/helpers';
import sendAnnotationHelper from './sendAnnotationHelper';

export default function sendBulkAnnotations(...args) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  args.pop().forEach(annotation => sendAnnotationHelper(annotation, meetingId, requesterUserId));
}
