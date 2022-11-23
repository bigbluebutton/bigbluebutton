import { check } from 'meteor/check';
import padCapture from '../methods/padCapture';

export default function captureSharedNotes({ body }, parentMeetingId) {
  check(body, Object);
  check(parentMeetingId, String);

  const { breakoutId, meetingName } = body;

  check(breakoutId, String);
  check(meetingName, String);

  padCapture(breakoutId, parentMeetingId, meetingName);
}
