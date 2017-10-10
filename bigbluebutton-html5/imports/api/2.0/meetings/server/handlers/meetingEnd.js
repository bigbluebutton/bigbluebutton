import { check } from 'meteor/check';
import removeMeeting from '../modifiers/removeMeeting';

export default function handleMeetingEnd({ body }, meetingId) {
  check(meetingId, String);

  return removeMeeting(meetingId);
}
