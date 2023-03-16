import { check } from 'meteor/check';
import padCapture from '../methods/padCapture';

export default async function captureSharedNotes({ header, body }) {
  check(header, Object);
  check(body, Object);

  const {
    meetingId: parentMeetingId,
  } = header;

  const {
    breakoutId,
    filename,
  } = body;

  check(breakoutId, String);
  check(parentMeetingId, String);
  check(filename, String);

  await padCapture(breakoutId, parentMeetingId, filename);
}
