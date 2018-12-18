import { check } from 'meteor/check';
import sharedWebcam from '../modifiers/sharedWebcam';

export default function handleUserSharedHtml5Webcam({ header, body }, meetingId) {
  const { userId, stream } = body;
  const isValidStream = (testString) => {
    // Checking if the stream name is a flash one
    const regexp = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
    return !regexp.test(testString);
  };

  check(header, Object);
  check(meetingId, String);
  check(userId, String);
  check(stream, String);

  if (!isValidStream(stream)) return false;

  return sharedWebcam(meetingId, userId);
}
