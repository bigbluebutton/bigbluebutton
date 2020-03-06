import { check } from 'meteor/check';
import addUploadRequest from '../modifiers/addUploadRequest';

export default function handleUploadRequestResp({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const {
    source,
    filename,
    userId,
    success,
    timestamp,
    token,
  } = body;

  return addUploadRequest(meetingId, source, filename, userId, success, timestamp, token);
}
