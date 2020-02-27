import { check } from 'meteor/check';
import addUpload from '../modifiers/addUpload';

export default function handleUploadRequestResp({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const {
    source,
    filename,
    userId,
    success,
    token,
  } = body;

  return addUpload(meetingId, source, filename, userId, success, token);
}
