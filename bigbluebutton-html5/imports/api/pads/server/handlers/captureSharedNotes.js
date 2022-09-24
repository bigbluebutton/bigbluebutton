import { check } from 'meteor/check';
import padCapture from '../methods/padCapture';

export default function captureSharedNotes({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { parentMeetingId } = body;

  check(parentMeetingId, String);

  padCapture(meetingId, parentMeetingId);
}
