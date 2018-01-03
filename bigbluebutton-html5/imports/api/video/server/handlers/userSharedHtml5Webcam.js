import sharedWebcam from '../modifiers/sharedWebcam';
import {check} from 'meteor/check';

export default function handleUserSharedHtml5Webcam({ header }, meetingId ) {
  check(header, Object);
  const { userId } = header;
  check(meetingId, String);
  check(userId, String);

  return sharedWebcam(meetingId, userId);
}
