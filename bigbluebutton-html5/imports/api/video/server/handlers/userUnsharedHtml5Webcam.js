import unsharedWebcam from '../modifiers/unsharedWebcam';
import { check } from 'meteor/check';

export default function handleUserUnsharedHtml5Webcam({ header, payload }) {
  const meetingId = header.meetingId;
  const userId = header.userId;

  check(meetingId, String);

  return unsharedWebcam(meetingId, userId);
}
