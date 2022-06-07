import { check } from 'meteor/check';
import sharedWebcam from '../modifiers/sharedWebcam';
import { isValidStream } from '/imports/api/video-streams/server/helpers';

export default function handleUserSharedHtml5Webcam({ header, body }, meetingId) {
  const { userId, stream } = body;

  check(header, Object);
  check(meetingId, String);
  check(userId, String);
  check(stream, String);

  if (!isValidStream(stream)) return false;

  return sharedWebcam(meetingId, userId, stream);
}
