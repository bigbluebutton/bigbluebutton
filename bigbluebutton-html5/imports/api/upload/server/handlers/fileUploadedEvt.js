import { check } from 'meteor/check';
import { isNotificationEnabled } from '../helpers';
import addNotification from '../modifiers/addNotification';
import addUploadedFile from '../modifiers/addUploadedFile';

export default function handleFileUploadedEvt({ header, body }, meetingId) {
  check(body, Object);
  check(header, Object);
  check(meetingId, String);

  const { userId } = header;

  const {
    uploadId,
    source,
    filename,
  } = body;

  if (isNotificationEnabled()) {
    addNotification(meetingId, userId, uploadId, source, filename);
  }
  
  return addUploadedFile(meetingId, userId, uploadId, source, filename);
}
