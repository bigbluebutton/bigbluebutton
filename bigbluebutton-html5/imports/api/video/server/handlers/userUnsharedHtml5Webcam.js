import unsharedWebcam from '../modifiers/unsharedWebcam';
import { check } from 'meteor/check';

export default function handleUserUnsharedHtml5Webcam({ header }, meetingId) {
  check(header, Object);
  const { userId } = header;
  check(meetingId, String);
  check(userId, String);

  return unsharedWebcam(meetingId, userId);
}
