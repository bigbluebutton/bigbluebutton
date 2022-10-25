import { check } from 'meteor/check';
import padCapture from '../methods/padCapture';

export default function captureSharedNotes({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { parentMeetingId, meetingName, sequence } = body;

  check(parentMeetingId, String);
  check(meetingName, String);
  check(sequence, Number);

  padCapture(meetingId, parentMeetingId, meetingName, sequence);
}
