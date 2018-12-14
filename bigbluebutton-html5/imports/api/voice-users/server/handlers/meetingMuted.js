import changeMuteMeeting from '../modifiers/changeMuteMeeting';

export default function handleMeetingMuted({ body }, meetingId) {
  return changeMuteMeeting(meetingId, body);
}
