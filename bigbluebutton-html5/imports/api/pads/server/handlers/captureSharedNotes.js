import { check } from 'meteor/check';
import padCapture from '../methods/padCapture';

export default function captureSharedNotes({ header, body }) {
  check(header, Object);
  check(body, Object);

  const {
    meetingId: parentMeetingId,
  } = header;

  const {
    breakoutId,
  } = body;

  check(breakoutId, String);
  check(parentMeetingId, String);

  padCapture(breakoutId, parentMeetingId);
}
