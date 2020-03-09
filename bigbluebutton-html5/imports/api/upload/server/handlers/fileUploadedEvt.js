import { check } from 'meteor/check';
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

  return addUploadedFile(meetingId, userId, uploadId, source, filename);
}
