import { check } from 'meteor/check';
import unsharedWebcam from '../modifiers/unsharedWebcam';
import { isValidStream } from '/imports/api/video-streams/server/helpers';

export default function handleUserUnsharedHtml5Webcam({ header, body }, meetingId) {
  const { userId, stream } = body;

  check(header, Object);
  check(meetingId, String);
  check(userId, String);
  check(stream, String);

  if (!isValidStream(stream)) return false;

  return unsharedWebcam(meetingId, userId, stream);
}
