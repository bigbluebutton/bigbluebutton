import { check } from 'meteor/check';
import padCapture from '../methods/padCapture';

export default function captureSharedNotes({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { parentMeetingId, meetingName } = body;

  check(parentMeetingId, String);
  check(meetingName, String);

  padCapture(meetingId, parentMeetingId, meetingName);
}
