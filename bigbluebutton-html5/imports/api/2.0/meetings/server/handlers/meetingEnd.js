import { check } from 'meteor/check';
import removeMeeting from '../modifiers/removeMeeting';

export default function handleMeetingDestruction({ body }, meetingId) {
  check(meetingId, String);

  return removeMeeting(meetingId);
}
