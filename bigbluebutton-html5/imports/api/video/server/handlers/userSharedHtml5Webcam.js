import sharedWebcam from '../modifiers/sharedWebcam';
import { check } from 'meteor/check';

export default function handleUserSharedHtml5Webcam({ header, body }, meetingId ) {
  const { userId, stream } = body;
  const isValidStream = Match.Where((stream) => {
    check(stream, String);
    // Checking if the stream name is a flash one
    const regexp = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
    return !regexp.test(stream);
  });

  check(header, Object);
  check(meetingId, String);
  check(userId, String);
  check(stream, isValidStream);

  return sharedWebcam(meetingId, userId);
}
